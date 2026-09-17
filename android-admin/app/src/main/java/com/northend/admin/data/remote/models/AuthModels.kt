package com.northend.admin.data.remote

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass


data class LoginRequest(
    val email: String,
    val password: String
)


data class LoginResponse(
    @Json(name = "access_token") val accessToken: String,
    @Json(name = "refresh_token") val refreshToken: String,
    val user: User
)


data class RefreshRequest(
    @Json(name = "refresh_token") val refreshToken: String
)


data class RefreshResponse(
    @Json(name = "access_token") val accessToken: String,
    @Json(name = "refresh_token") val refreshToken: String?
)


data class User(
    val id: String,
    val name: String,
    val email: String,
    val role: String,
    @Json(name = "branch_id") val branchId: String? = null,
    val branch: Branch? = null,
    val phone: String? = null
)


data class Branch(
    val id: String,
    val name: String,
    val code: String? = null,
    val city: String? = null,
    val address: String? = null,
    val phone: String? = null
)


data class MetaResponse(
    @Json(name = "expense_categories") val expenseCategories: List<String> = emptyList(),
    @Json(name = "payment_modes") val paymentModes: List<String> = emptyList(),
    @Json(name = "lead_statuses") val leadStatuses: List<String> = emptyList(),
    @Json(name = "cgst_rate") val cgstRate: Double = 0.0,
    @Json(name = "sgst_rate") val sgstRate: Double = 0.0,
    val roles: List<String> = emptyList()
)


data class SendOtpRequest(
    val identifier: String,
    val action: String = "login"
)

data class SendOtpResponse(
    val message: String
)

data class VerifyOtpRequest(
    val identifier: String,
    val code: String,
    val action: String = "login"
)
