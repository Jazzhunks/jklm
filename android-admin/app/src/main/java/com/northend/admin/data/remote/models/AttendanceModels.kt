package com.northend.admin.data.remote.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass


data class AttendanceLog(
    val id: String,
    @Json(name = "student_id") val studentId: String,
    @Json(name = "student_no") val studentNo: String,
    @Json(name = "full_name") val fullName: String,
    val batch: String? = null,
    @Json(name = "branch_id") val branchId: String,
    val status: String,
    val mode: String? = null,
    @Json(name = "device_signature") val deviceSignature: String? = null,
    @Json(name = "scanned_at") val scannedAt: String? = null
)


data class AttendanceScanRequest(
    @Json(name = "student_no") val studentNo: String,
    @Json(name = "device_signature") val deviceSignature: String? = "TER-GATE-01"
)


data class AttendanceOverrideRequest(
    @Json(name = "student_id") val studentId: String,
    val status: String
)
