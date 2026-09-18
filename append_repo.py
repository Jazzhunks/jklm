with open("android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt", "r") as f:
    text = f.read()

# Add the DAO to the constructor
text = text.replace(
    "private val tokenManager: TokenManager",
    "private val tokenManager: TokenManager,\n    private val whatsAppDao: com.northend.admin.data.local.room.WhatsAppDao"
)

# Append methods before the last brace
methods = """
    // OFFLINE-FIRST WHATSAPP LOGIC
    fun getLocalWhatsAppThreads() = whatsAppDao.getAllThreads()
    
    suspend fun syncWhatsAppThreads() {
        try {
            val response = apiService.getWhatsAppThreads()
            if (response.isSuccessful && response.body() != null) {
                val entities = response.body()!!.map {
                    com.northend.admin.data.local.room.ThreadEntity(
                        id = it.id,
                        contactName = it.contactName,
                        contactPhone = it.contactPhone,
                        lastMessage = it.lastMessage,
                        lastMessageTime = it.lastMessageTime,
                        unreadCount = it.unreadCount,
                        avatarUrl = it.avatarUrl
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
                val entities = response.body()!!.map {
                    com.northend.admin.data.local.room.MessageEntity(
                        id = it.id,
                        threadId = threadId,
                        content = it.content,
                        timestamp = it.timestamp,
                        isFromMe = it.isFromMe,
                        status = it.status
                    )
                }
                whatsAppDao.insertMessages(entities)
            }
        } catch (e: Exception) {
        }
    }
}
"""

text = text.rsplit("}", 1)[0] + methods

with open("android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt", "w") as f:
    f.write(text)
