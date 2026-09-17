import re

with open('android-admin/app/src/main/java/com/northend/admin/data/remote/AdminApiService.kt', 'r') as f:
    api = f.read()

fcm_api = """    @POST("erp/users/fcm-token")
    suspend fun updateFcmToken(@Body request: com.northend.admin.data.remote.models.FCMTokenRequest): retrofit2.Response<Any>
"""
if "updateFcmToken" not in api:
    api = api.replace('interface AdminApiService {', 'interface AdminApiService {\n' + fcm_api)

with open('android-admin/app/src/main/java/com/northend/admin/data/remote/AdminApiService.kt', 'w') as f:
    f.write(api)

with open('android-admin/app/src/main/java/com/northend/admin/data/remote/models/AuthModels.kt', 'r') as f:
    auth_models = f.read()

if "FCMTokenRequest" not in auth_models:
    auth_models += '\n@com.squareup.moshi.JsonClass(generateAdapter = true)\ndata class FCMTokenRequest(val token: String)\n'

with open('android-admin/app/src/main/java/com/northend/admin/data/remote/models/AuthModels.kt', 'w') as f:
    f.write(auth_models)

with open('android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt', 'r') as f:
    repo = f.read()

fcm_repo = """
    suspend fun updateFcmToken(token: String): ResultWrapper<Any> {
        return safeApiCall { apiService.updateFcmToken(com.northend.admin.data.remote.models.FCMTokenRequest(token)) }
    }
"""
if "updateFcmToken" not in repo:
    repo = repo.replace('suspend fun login', fcm_repo + '\n    suspend fun login')

with open('android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt', 'w') as f:
    f.write(repo)

print("Repo patched")
