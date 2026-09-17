with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/data/remote/AdminApiService.kt', 'r') as f:
    api = f.read()

otp_endpoints = """
    @POST("auth/send-otp")
    suspend fun sendOtp(@Body request: com.northend.admin.data.remote.SendOtpRequest): Response<com.northend.admin.data.remote.SendOtpResponse>

    @POST("auth/verify-otp")
    suspend fun verifyOtp(@Body request: com.northend.admin.data.remote.VerifyOtpRequest): Response<com.northend.admin.data.remote.LoginResponse>
"""

# Insert before "    @GET("erp/meta")"
api = api.replace('    @GET("erp/meta")', otp_endpoints + '\n    @GET("erp/meta")')

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/data/remote/AdminApiService.kt', 'w') as f:
    f.write(api)

print("AdminApiService patched")
