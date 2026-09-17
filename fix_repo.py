import re

with open('android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt', 'r') as f:
    repo = f.read()

# Add safeResponseCall
safe_resp = '''
    private suspend fun <T> safeResponseCall(apiCall: suspend () -> retrofit2.Response<T>): ResultWrapper<T> = withContext(Dispatchers.IO) {
        try {
            val response = apiCall()
            if (response.isSuccessful) {
                ResultWrapper.Success(response.body()!!)
            } else {
                val errorMsg = response.errorBody()?.string() ?: response.message()
                // Try to extract detail message if it's a JSON {"detail": "..."}
                val cleanError = try {
                    val jsonObj = org.json.JSONObject(errorMsg)
                    jsonObj.optString("detail", errorMsg)
                } catch (e: Exception) {
                    errorMsg
                }
                ResultWrapper.Error(cleanError)
            }
        } catch (e: Exception) {
            ResultWrapper.Error(e.localizedMessage ?: "Unknown error")
        }
    }

    private suspend fun <T> safeApiCall'''

repo = repo.replace('    private suspend fun <T> safeApiCall', safe_resp)

# Replace standard body()!! calls
repo = re.sub(r'safeApiCall \{ (apiService\.[a-zA-Z0-9_]+\([^\)]*\))\.body\(\)!! \}', r'safeResponseCall { \1 }', repo)

# Special cases
# safeApiCall { apiService.updateFcmToken(com.northend.admin.data.remote.FCMTokenRequest(token)) }
repo = repo.replace('safeApiCall { apiService.updateFcmToken', 'safeResponseCall { apiService.updateFcmToken')

# safeApiCall { apiService.getWhatsAppMessages(threadId).body()!!.items }
# We can just change it to parse the items manually after safeResponseCall
wa_msg_replace = '''
    suspend fun getWhatsAppMessages(threadId: String): ResultWrapper<List<com.northend.admin.data.remote.models.WhatsAppMessage>> {
        val res = safeResponseCall { apiService.getWhatsAppMessages(threadId) }
        return if (res is ResultWrapper.Success) {
            ResultWrapper.Success(res.data.items)
        } else {
            res as ResultWrapper.Error
        }
    }'''
# Find the original getWhatsAppMessages definition
repo = re.sub(r'\s*suspend fun getWhatsAppMessages\(.*?\).*?\{.*?\}', wa_msg_replace, repo, flags=re.DOTALL)

with open('android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt', 'w') as f:
    f.write(repo)
