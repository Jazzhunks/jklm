with open('android-admin/app/src/main/java/com/northend/admin/data/remote/models/WhatsAppModels.kt', 'r') as f:
    models = f.read()

if "WhatsAppMessagesResponse" not in models:
    models += '\n@JsonClass(generateAdapter = true)\ndata class WhatsAppMessagesResponse(val items: List<WhatsAppMessage>)\n'
    with open('android-admin/app/src/main/java/com/northend/admin/data/remote/models/WhatsAppModels.kt', 'w') as f:
        f.write(models)

with open('android-admin/app/src/main/java/com/northend/admin/data/remote/AdminApiService.kt', 'r') as f:
    api = f.read()

api = api.replace('retrofit2.Response<List<com.northend.admin.data.remote.models.WhatsAppMessage>>', 'retrofit2.Response<com.northend.admin.data.remote.models.WhatsAppMessagesResponse>')

with open('android-admin/app/src/main/java/com/northend/admin/data/remote/AdminApiService.kt', 'w') as f:
    f.write(api)

with open('android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt', 'r') as f:
    repo = f.read()

repo = repo.replace('safeApiCall { apiService.getWhatsAppMessages(threadId).body()!! }', 'safeApiCall { apiService.getWhatsAppMessages(threadId).body()!!.items }')

with open('android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt', 'w') as f:
    f.write(repo)
