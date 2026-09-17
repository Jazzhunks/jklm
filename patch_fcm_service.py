with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/service/MyFirebaseMessagingService.kt', 'r') as f:
    service = f.read()

# Replace the sendNotification method signature and intent creation
new_method = """    private fun sendNotification(title: String, messageBody: String, targetPath: String?) {
        val intent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            if (targetPath != null) {
                putExtra("target_path", targetPath)
            }
        }"""

service = service.replace('private fun sendNotification(title: String, messageBody: String) {', new_method)
service = service.replace('val intent = Intent(this, MainActivity::class.java).apply {\n            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)\n        }', '')

# Update the onMessageReceived call
call = """        val title = remoteMessage.notification?.title ?: remoteMessage.data["title"] ?: "NorthEnd Update"
        val body = remoteMessage.notification?.body ?: remoteMessage.data["body"] ?: ""
        val targetPath = remoteMessage.data["target_path"] // e.g. "/admin/whatsapp"

        sendNotification(title, body, targetPath)"""

service = service.replace("""        val title = remoteMessage.notification?.title ?: remoteMessage.data["title"] ?: "NorthEnd Update"
        val body = remoteMessage.notification?.body ?: remoteMessage.data["body"] ?: ""

        sendNotification(title, body)""", call)

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/service/MyFirebaseMessagingService.kt', 'w') as f:
    f.write(service)

print("FCM patched")
