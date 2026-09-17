package com.northend.admin.data.remote.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass


data class Lead(
    val id: String,
    val name: String,
    val phone: String,
    @Json(name = "present_class") val presentClass: String? = null,
    @Json(name = "moving_to_class") val movingToClass: String? = null,
    val address: String? = null,
    val remarks: String? = null,
    @Json(name = "branch_id") val branchId: String,
    @Json(name = "counsellor_id") val counsellorId: String? = null,
    val source: String? = "Manual",
    val campaign: String? = null,
    val temperature: String? = "warm",
    val status: String? = "new",
    val interactions: List<LeadInteraction> = emptyList()
)


data class LeadInteraction(
    val type: String? = null,
    val notes: String? = null,
    @Json(name = "contacted_at") val contactedAt: String? = null,
    @Json(name = "next_followup_at") val nextFollowupAt: String? = null
)


data class LeadCreateRequest(
    val name: String,
    val phone: String,
    @Json(name = "present_class") val presentClass: String? = null,
    @Json(name = "moving_to_class") val movingToClass: String? = null,
    val address: String? = null,
    val remarks: String? = null,
    @Json(name = "branch_id") val branchId: String,
    @Json(name = "counsellor_id") val counsellorId: String? = null,
    val source: String? = "Manual",
    val campaign: String? = null,
    val temperature: String? = "warm"
)


data class LeadUpdateRequest(
    val status: String? = null,
    @Json(name = "present_class") val presentClass: String? = null,
    @Json(name = "moving_to_class") val movingToClass: String? = null,
    val address: String? = null,
    val remarks: String? = null,
    @Json(name = "counsellor_id") val counsellorId: String? = null,
    @Json(name = "next_followup_at") val nextFollowupAt: String? = null,
    val temperature: String? = null,
    val source: String? = null
)
