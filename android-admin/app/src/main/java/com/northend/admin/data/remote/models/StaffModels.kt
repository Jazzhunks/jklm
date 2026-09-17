package com.northend.admin.data.remote.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass


data class StaffCreateRequest(
    val name: String,
    val email: String,
    val password: String,
    val role: String,
    @Json(name = "branch_id") val branchId: String,
    val phone: String? = null
)


data class StaffUpdateRequest(
    val name: String? = null,
    val role: String? = null,
    @Json(name = "branch_id") val branchId: String? = null,
    val phone: String? = null,
    val active: Boolean? = null,
    @Json(name = "new_password") val newPassword: String? = null
)


data class BranchUpdateRequest(
    val name: String? = null,
    val code: String? = null,
    val city: String? = null,
    val address: String? = null,
    val phone: String? = null,
    val gstin: String? = null,
    @Json(name = "signatory_name") val signatoryName: String? = null,
    @Json(name = "state_code") val stateCode: String? = null,
    @Json(name = "manager_user_id") val managerUserId: String? = null
)
