with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt', 'r') as f:
    repo = f.read()

repo_methods = """
    suspend fun sendOtp(identifier: String, action: String = "login"): ResultWrapper<com.northend.admin.data.remote.SendOtpResponse> =
        safeApiCall { apiService.sendOtp(com.northend.admin.data.remote.SendOtpRequest(identifier, action)).body()!! }

    suspend fun verifyOtp(identifier: String, code: String, action: String = "login"): ResultWrapper<com.northend.admin.data.remote.LoginResponse> =
        safeApiCall {
            val response = apiService.verifyOtp(com.northend.admin.data.remote.VerifyOtpRequest(identifier, code, action)).body()!!
            tokenManager.saveTokens(response.accessToken, response.refreshToken)
            response
        }
"""

# Insert before "    suspend fun getMe"
repo = repo.replace('    suspend fun getMe', repo_methods + '\n    suspend fun getMe')

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt', 'w') as f:
    f.write(repo)

print("AdminRepository patched")
