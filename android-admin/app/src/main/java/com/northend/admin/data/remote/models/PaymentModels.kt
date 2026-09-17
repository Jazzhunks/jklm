package com.northend.admin.data.remote.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass


data class Payment(
    val id: String,
    @Json(name = "student_id") val studentId: String,
    val amount: Double,
    val mode: String,
    @Json(name = "paid_at") val paidAt: String? = null,
    @Json(name = "transaction_ref") val transactionRef: String? = null,
    val notes: String? = null,
    @Json(name = "apply_gst") val applyGst: Boolean = true,
    @Json(name = "receipt_no") val receiptNo: String? = null,
    @Json(name = "branch_id") val branchId: String? = null,
    @Json(name = "base_amount") val baseAmount: Double? = null,
    val cgst: Double? = null,
    val sgst: Double? = null
)


data class PaymentCreateRequest(
    @Json(name = "student_id") val studentId: String,
    val amount: Double,
    val mode: String,
    @Json(name = "next_due_date") val nextDueDate: String? = null,
    val notes: String? = null,
    @Json(name = "transaction_ref") val transactionRef: String? = null,
    @Json(name = "apply_gst") val applyGst: Boolean = true
)
