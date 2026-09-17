package com.northend.admin.data.remote.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass
import com.northend.admin.data.remote.Branch


data class DashboardSuperResponse(
    @Json(name = "total_revenue") val totalRevenue: Double,
    @Json(name = "total_expense") val totalExpense: Double,
    @Json(name = "net_income") val netIncome: Double,
    @Json(name = "total_pending_fees") val totalPendingFees: Double,
    @Json(name = "total_students") val totalStudents: Int,
    @Json(name = "total_branches") val totalBranches: Int,
    val branches: List<BranchRow> = emptyList()
)


data class BranchRow(
    @Json(name = "branch_id") val branchId: String,
    @Json(name = "branch_name") val branchName: String? = null,
    val city: String? = null,
    val revenue: Double = 0.0,
    val expense: Double = 0.0,
    val net: Double = 0.0,
    val students: Int = 0
)


data class DashboardBranchResponse(
    val branch: Branch? = null,
    val revenue: Double = 0.0,
    val expense: Double = 0.0,
    @Json(name = "pending_fees") val pendingFees: Double = 0.0,
    @Json(name = "student_count") val studentCount: Int = 0,
    @Json(name = "lead_count") val leadCount: Int = 0,
    @Json(name = "expense_by_category") val expenseByCategory: Map<String, Double> = emptyMap(),
    @Json(name = "counsellor_performance") val counsellorPerformance: List<CounsellorRow> = emptyList(),
    @Json(name = "recent_payments") val recentPayments: List<Payment> = emptyList()
)


data class CounsellorRow(
    val name: String? = null,
    val leads: Int = 0,
    val converted: Int = 0
)
