with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt', 'r') as f:
    repo = f.read()

import re
# Just strip out ALL instances of sendOtp and verifyOtp, then add it exactly once.
repo = re.sub(r'suspend fun sendOtp\(identifier: String.*?\n\s*safeApiCall \{ apiService\.sendOtp.*?\}', '', repo, flags=re.DOTALL)
repo = re.sub(r'suspend fun verifyOtp\(identifier: String.*?\n\s*safeApiCall \{.*?response\s*\}', '', repo, flags=re.DOTALL)

# Also remove lingering empty lines if possible
repo = re.sub(r'\n\s*\n\s*\n', '\n\n', repo)

otp_methods = """
    suspend fun sendOtp(identifier: String, action: String = "login"): ResultWrapper<com.northend.admin.data.remote.SendOtpResponse> =
        safeApiCall { apiService.sendOtp(com.northend.admin.data.remote.SendOtpRequest(identifier, action)).body()!! }

    suspend fun verifyOtp(identifier: String, code: String, action: String = "login"): ResultWrapper<com.northend.admin.data.remote.LoginResponse> =
        safeApiCall {
            val response = apiService.verifyOtp(com.northend.admin.data.remote.VerifyOtpRequest(identifier, code, action)).body()!!
            tokenManager.saveTokens(response.accessToken, response.refreshToken)
            response
        }
"""

repo = repo.replace('    suspend fun getMe', otp_methods + '\n    suspend fun getMe')

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt', 'w') as f:
    f.write(repo)
