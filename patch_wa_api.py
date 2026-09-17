with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/data/remote/AdminApiService.kt', 'r') as f:
    api = f.read()

wa_endpoints = """
    @GET("whatsapp/threads")
    suspend fun listWhatsAppThreads(@Query("limit") limit: Int = 100): retrofit2.Response<List<com.northend.admin.data.remote.models.WhatsAppThread>>

    @GET("whatsapp/threads/{id}/messages")
    suspend fun getWhatsAppMessages(@Path("id") threadId: String, @Query("limit") limit: Int = 200): retrofit2.Response<List<com.northend.admin.data.remote.models.WhatsAppMessage>>

    @POST("whatsapp/threads/{id}/messages")
    suspend fun sendWhatsAppMessage(@Path("id") threadId: String, @Body req: com.northend.admin.data.remote.models.WhatsAppSendMessageRequest): retrofit2.Response<com.northend.admin.data.remote.models.WhatsAppMessage>
"""

api = api.replace('    @GET("erp/meta")', wa_endpoints + '\n    @GET("erp/meta")')
with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/data/remote/AdminApiService.kt', 'w') as f:
    f.write(api)

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt', 'r') as f:
    repo = f.read()

wa_repo = """
    suspend fun listWhatsAppThreads(): ResultWrapper<List<com.northend.admin.data.remote.models.WhatsAppThread>> =
        safeApiCall { apiService.listWhatsAppThreads().body()!! }

    suspend fun getWhatsAppMessages(threadId: String): ResultWrapper<List<com.northend.admin.data.remote.models.WhatsAppMessage>> =
        safeApiCall { apiService.getWhatsAppMessages(threadId).body()!! }

    suspend fun sendWhatsAppMessage(threadId: String, text: String): ResultWrapper<com.northend.admin.data.remote.models.WhatsAppMessage> =
        safeApiCall { apiService.sendWhatsAppMessage(threadId, com.northend.admin.data.remote.models.WhatsAppSendMessageRequest(text = text)).body()!! }
"""

repo = repo.replace('    suspend fun getMeta()', wa_repo + '\n    suspend fun getMeta()')
with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt', 'w') as f:
    f.write(repo)

print("WhatsApp API patched")
