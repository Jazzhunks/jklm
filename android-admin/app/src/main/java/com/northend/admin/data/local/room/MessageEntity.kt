package com.northend.admin.data.local.room

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
