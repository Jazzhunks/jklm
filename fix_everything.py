# Fix ThreadEntity
thread_entity = """package com.northend.admin.data.local.room

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "whatsapp_threads")
data class ThreadEntity(
    @PrimaryKey val id: String,
    val phone: String?,
    val contactName: String?,
    val studentName: String?,
    val lastMessagePreview: String?,
    val lastMessageAt: String?,
    val unreadCount: Int
)
"""
with open("android-admin/app/src/main/java/com/northend/admin/data/local/room/ThreadEntity.kt", "w") as f:
    f.write(thread_entity)

# Fix MessageEntity
msg_entity = """package com.northend.admin.data.local.room

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "whatsapp_messages")
data class MessageEntity(
    @PrimaryKey val id: String,
    val threadId: String,
    val direction: String,
    val kind: String,
    val text: String?,
    val status: String?,
    val timestamp: String
)
"""
with open("android-admin/app/src/main/java/com/northend/admin/data/local/room/MessageEntity.kt", "w") as f:
    f.write(msg_entity)

# Fix WhatsAppDao
dao = """package com.northend.admin.data.local.room

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface WhatsAppDao {

    @Query("SELECT * FROM whatsapp_threads ORDER BY lastMessageAt DESC")
    fun getAllThreads(): Flow<List<ThreadEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertThreads(threads: List<ThreadEntity>)

    @Query("SELECT * FROM whatsapp_messages WHERE threadId = :threadId ORDER BY timestamp ASC")
    fun getMessagesForThread(threadId: String): Flow<List<MessageEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessages(messages: List<MessageEntity>)
}
"""
with open("android-admin/app/src/main/java/com/northend/admin/data/local/room/WhatsAppDao.kt", "w") as f:
    f.write(dao)

# Fix ViewModel
import re
with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppViewModel.kt", "r") as f:
    vm_text = f.read()

vm_text = vm_text.replace(
    "WhatsAppThread(it.id, it.contactName, it.contactPhone, it.lastMessage, it.lastMessageTime, it.unreadCount, it.avatarUrl)",
    "WhatsAppThread(it.id, it.phone, it.contactName, it.studentName, it.lastMessagePreview, it.lastMessageAt, it.unreadCount, emptyList())"
)

vm_text = vm_text.replace(
    "WhatsAppMessage(it.id, it.content, it.timestamp, it.isFromMe, it.status)",
    "WhatsAppMessage(it.id, it.threadId, it.direction, it.kind, it.text, it.status, it.timestamp)"
)
with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppViewModel.kt", "w") as f:
    f.write(vm_text)

# Fix AdminRepository
with open("android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt", "r") as f:
    repo_text = f.read()

# Fix the method calls in sync logic
# syncWhatsAppThreads
repo_text = repo_text.replace("val response = apiService.getWhatsAppThreads()", "val response = apiService.listWhatsAppThreads()")
repo_text = repo_text.replace(
    "contactName = it.contactName,\n                        contactPhone = it.contactPhone,\n                        lastMessage = it.lastMessage,\n                        lastMessageTime = it.lastMessageTime,\n                        unreadCount = it.unreadCount,\n                        avatarUrl = it.avatarUrl",
    "phone = it.phone,\n                        contactName = it.contactName,\n                        studentName = it.studentName,\n                        lastMessagePreview = it.lastMessagePreview,\n                        lastMessageAt = it.lastMessageAt,\n                        unreadCount = it.unreadCount"
)

# syncWhatsAppMessages
# Check what listWhatsAppMessages is called in AdminApiService
# We need to know if it's listWhatsAppMessages!
