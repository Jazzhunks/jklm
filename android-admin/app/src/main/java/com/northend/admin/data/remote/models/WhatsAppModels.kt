package com.northend.admin.data.remote.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class WhatsAppThread(
    val id: String,
    @Json(name = "wa_id") val phone: String? = null,
    @Json(name = "profile_name") val contactName: String? = null,
    @Json(name = "linked_name") val studentName: String? = null,
    @Json(name = "last_message_preview") val lastMessagePreview: String? = null,
    @Json(name = "last_message_at") val lastMessageAt: String? = null,
    @Json(name = "unread_count") val unreadCount: Int = 0,
    val tags: List<String> = emptyList()
)

@JsonClass(generateAdapter = true)
data class WhatsAppMessage(
    val id: String,
    @Json(name = "thread_id") val threadId: String,
    val direction: String, // "inbound" or "outbound"
    val kind: String, // "text", "template", "image", etc.
    val text: String? = null,
    val status: String? = null, // "sent", "delivered", "read", "failed"
    val timestamp: String
)

@JsonClass(generateAdapter = true)
data class WhatsAppSendMessageRequest(
    val kind: String = "text",
    val text: String
)

@JsonClass(generateAdapter = true)
data class WhatsAppMessagesResponse(val items: List<WhatsAppMessage>)
