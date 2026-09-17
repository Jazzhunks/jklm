package com.northend.admin.data.remote.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass


data class Expense(
    val id: String,
    @Json(name = "branch_id") val branchId: String,
    val category: String,
    val amount: Double,
    val description: String,
    val vendor: String? = null,
    @Json(name = "expense_date") val expenseDate: String? = null,
    @Json(name = "payment_mode") val paymentMode: String? = null,
    val status: String? = "pending",
    @Json(name = "bill_url") val billUrl: String? = null,
    @Json(name = "recorded_by_name") val recordedByName: String? = null
)


data class ExpenseCreateRequest(
    @Json(name = "branch_id") val branchId: String,
    val category: String,
    val amount: Double,
    val description: String,
    val vendor: String? = null,
    @Json(name = "expense_date") val expenseDate: String? = null,
    @Json(name = "payment_mode") val paymentMode: String? = "online"
)


data class ExpenseDecisionRequest(
    val decision: String,
    val note: String? = null
)
