import re

with open('android-admin/app/src/main/java/com/northend/admin/data/remote/models/WhatsAppModels.kt', 'r') as f:
    models = f.read()

models = models.replace('data class WhatsAppThread', '@JsonClass(generateAdapter = true)\ndata class WhatsAppThread')
models = models.replace('data class WhatsAppMessage(', '@JsonClass(generateAdapter = true)\ndata class WhatsAppMessage(')
models = models.replace('data class WhatsAppSendMessageRequest', '@JsonClass(generateAdapter = true)\ndata class WhatsAppSendMessageRequest')
# Fix double annotations if already present
models = re.sub(r'(@JsonClass\(generateAdapter = true\)\n)+', '@JsonClass(generateAdapter = true)\n', models)

with open('android-admin/app/src/main/java/com/northend/admin/data/remote/models/WhatsAppModels.kt', 'w') as f:
    f.write(models)
