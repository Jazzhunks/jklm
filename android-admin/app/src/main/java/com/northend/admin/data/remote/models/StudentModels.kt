package com.northend.admin.data.remote.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass


data class Student(
    val id: String,
    @Json(name = "full_name") val fullName: String,
    @Json(name = "contact_phone") val contactPhone: String,
    @Json(name = "course_id") val courseId: String,
    @Json(name = "branch_id") val branchId: String,
    val status: String? = "active",
    val batch: String? = null,
    @Json(name = "total_fee") val totalFee: Double = 0.0,
    @Json(name = "scholarship_percent") val scholarshipPercent: Double = 0.0,
    val discount: Double = 0.0,
    @Json(name = "student_no") val studentNo: String? = null,
    @Json(name = "parent_name") val parentName: String? = null,
    @Json(name = "parent_phone") val parentPhone: String? = null,
    val address: String? = null,
    @Json(name = "photo_url") val photoUrl: String? = null,
    val documents: List<Map<String, Any>> = emptyList(),
    val gender: String? = null,
    val dob: String? = null,
    @Json(name = "school_institute") val schoolInstitute: String? = null,
    val board: String? = null,
    val category: String? = null,
    @Json(name = "emergency_phone") val emergencyPhone: String? = null,
    @Json(name = "parent_email") val parentEmail: String? = null,
    @Json(name = "contact_email") val contactEmail: String? = null,
    @Json(name = "admission_date") val admissionDate: String? = null,
    @Json(name = "course_duration") val courseDuration: String? = null,
    @Json(name = "counsellor_id") val counsellorId: String? = null,
    val luid: String? = null,
    @Json(name = "enrollment_number") val enrollmentNumber: String? = null,
    val notes: String? = null
)
