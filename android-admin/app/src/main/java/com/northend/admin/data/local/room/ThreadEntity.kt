package com.northend.admin.data.local.room

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
