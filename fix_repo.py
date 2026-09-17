with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt', 'r') as f:
    repo = f.read()

import re
# Remove duplicate sendOtp/verifyOtp block
# The block looks like:
# suspend fun sendOtp(identifier: String, action: String = "login"): ResultWrapper<com.northend.admin.data.remote.SendOtpResponse> = ...
# Let's just find and replace the second occurrence, or we can just reconstruct the file.
# Since it's easier, let's use regex to remove all of them and insert just one.

repo = re.sub(r'suspend fun sendOtp\(identifier: String.*?action: String = "login"\): ResultWrapper<com\.northend\.admin\.data\.remote\.SendOtpResponse> =\s*safeApiCall \{ apiService\.sendOtp\(com\.northend\.admin\.data\.remote\.SendOtpRequest\(identifier, action\)\)\.body\(\)!! \}', '', repo, flags=re.DOTALL)
repo = re.sub(r'suspend fun verifyOtp\(identifier: String.*?action: String = "login"\): ResultWrapper<com\.northend\.admin\.data\.remote\.LoginResponse> =\s*safeApiCall \{\s*val response = apiService\.verifyOtp\(com\.northend\.admin\.data\.remote\.VerifyOtpRequest\(identifier, code, action\)\)\.body\(\)!!\s*tokenManager\.saveTokens\(response\.accessToken, response\.refreshToken\)\s*response\s*\}', '', repo, flags=re.DOTALL)

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

repo = repo.replace('    suspend fun getMe', repo_methods + '\n    suspend fun getMe')

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt', 'w') as f:
    f.write(repo)
print("Repo fixed")
