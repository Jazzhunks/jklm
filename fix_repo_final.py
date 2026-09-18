import re

with open("android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt", "r") as f:
    text = f.read()

# We will just strip everything from "fun getLocalWhatsAppThreads()" onwards and rewrite it correctly
text = text.split("fun getLocalWhatsAppThreads()")[0]

correct_methods = """fun getLocalWhatsAppThreads() = whatsAppDao.getAllThreads()
    
    suspend fun syncWhatsAppThreads() {
        try {
            val response = apiService.listWhatsAppThreads()
            if (response.isSuccessful && response.body() != null) {
                val entities = response.body()!!.map {
                    com.northend.admin.data.local.room.ThreadEntity(
                        id = it.id,
                        phone = it.phone,
                        contactName = it.contactName,
                        studentName = it.studentName,
                        lastMessagePreview = it.lastMessagePreview,
                        lastMessageAt = it.lastMessageAt,
                        unreadCount = it.unreadCount
                    )
                }
                whatsAppDao.insertThreads(entities)
            }
        } catch (e: Exception) {
        }
    }

    fun getLocalWhatsAppMessages(threadId: String) = whatsAppDao.getMessagesForThread(threadId)

    suspend fun syncWhatsAppMessages(threadId: String) {
        try {
            val response = apiService.getWhatsAppMessages(threadId)
            if (response.isSuccessful && response.body() != null) {
                val entities = response.body()!!.items.map {
                    com.northend.admin.data.local.room.MessageEntity(
                        id = it.id,
                        threadId = threadId,
                        direction = it.direction,
                        kind = it.kind,
                        text = it.text,
                        status = it.status,
                        timestamp = it.timestamp
                    )
                }
                whatsAppDao.insertMessages(entities)
            }
        } catch (e: Exception) {
        }
    }
}
"""

with open("android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt", "w") as f:
    f.write(text + correct_methods)
