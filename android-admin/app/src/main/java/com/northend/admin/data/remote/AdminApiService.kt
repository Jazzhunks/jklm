package com.northend.admin.data.remote

import com.northend.admin.data.remote.models.*
import retrofit2.Response
import retrofit2.http.*
import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

interface AdminApiService {

    // Auth
    @POST("auth/login")
    suspend fun login(@Body req: LoginRequest): Response<LoginResponse>

    @POST("auth/refresh")
    suspend fun refresh(@Body req: RefreshRequest): Response<RefreshResponse>

    @GET("auth/me")
    suspend fun me(): Response<User>

    @POST("auth/logout")
    suspend fun logout(): Response<Unit>

    // ERP Meta
    @GET("erp/me")
    suspend fun erpMe(): Response<User>


    @POST("auth/send-otp")
    suspend fun sendOtp(@Body request: com.northend.admin.data.remote.SendOtpRequest): Response<com.northend.admin.data.remote.SendOtpResponse>

    @POST("auth/verify-otp")
    suspend fun verifyOtp(@Body request: com.northend.admin.data.remote.VerifyOtpRequest): Response<com.northend.admin.data.remote.LoginResponse>


    @GET("whatsapp/threads")
    suspend fun listWhatsAppThreads(@Query("limit") limit: Int = 100): retrofit2.Response<List<com.northend.admin.data.remote.models.WhatsAppThread>>

    @GET("whatsapp/threads/{id}/messages")
    suspend fun getWhatsAppMessages(@Path("id") threadId: String, @Query("limit") limit: Int = 200): retrofit2.Response<List<com.northend.admin.data.remote.models.WhatsAppMessage>>

    @POST("whatsapp/threads/{id}/messages")
    suspend fun sendWhatsAppMessage(@Path("id") threadId: String, @Body req: com.northend.admin.data.remote.models.WhatsAppSendMessageRequest): retrofit2.Response<com.northend.admin.data.remote.models.WhatsAppMessage>

    @GET("erp/meta")
    suspend fun meta(): Response<MetaResponse>

    // Students
    @GET("erp/students")
    suspend fun listStudents(
        @Query("branch_id") branchId: String? = null,
        @Query("q") q: String? = null,
        @Query("search") search: String? = null,
        @Query("batch") batch: String? = null,
        @Query("status") status: String? = null,
        @Query("course_id") courseId: String? = null,
        @Query("counsellor_id") counsellorId: String? = null,
        @Query("include_temporary") includeTemporary: Boolean = false,
        @Query("skip") skip: Int? = null,
        @Query("limit") limit: Int? = null
    ): Response<List<Student>>

    @POST("erp/students")
    suspend fun createStudent(@Body student: Student): Response<Student>

    @PATCH("erp/students/{id}")
    suspend fun updateStudent(@Path("id") id: String, @Body student: Student): Response<Student>

    @DELETE("erp/students/{id}")
    suspend fun deleteStudent(@Path("id") id: String): Response<Unit>

    @GET("erp/students/{id}/statement")
    suspend fun studentStatement(@Path("id") id: String): Response<StudentStatement>

    @GET("erp/students/lookup")
    suspend fun lookupStudent(@Query("phone") phone: String): Response<LookupResponse>

    @Multipart
    @POST("erp/students/{id}/photo")
    suspend fun uploadPhoto(@Path("id") id: String, @Part photo: okhttp3.MultipartBody.Part): Response<PhotoResponse>

    // Payments
    @GET("erp/payments")
    suspend fun listPayments(
        @Query("student_id") studentId: String? = null,
        @Query("branch_id") branchId: String? = null,
        @Query("mode") mode: String? = null,
        @Query("search") search: String? = null,
        @Query("from_date") fromDate: String? = null,
        @Query("to_date") toDate: String? = null,
        @Query("skip") skip: Int? = null,
        @Query("limit") limit: Int? = null
    ): Response<List<Payment>>

    @POST("erp/payments")
    suspend fun createPayment(@Body payment: PaymentCreateRequest): Response<Payment>

    @PATCH("erp/payments/{id}")
    suspend fun updatePayment(@Path("id") id: String, @Body payment: Payment): Response<Payment>

    @DELETE("erp/payments/{id}")
    suspend fun deletePayment(@Path("id") id: String): Response<Unit>

    // Expenses
    @GET("erp/expenses")
    suspend fun listExpenses(
        @Query("branch_id") branchId: String? = null,
        @Query("category") category: String? = null,
        @Query("status") status: String? = null,
        @Query("search") search: String? = null,
        @Query("from_date") fromDate: String? = null,
        @Query("to_date") toDate: String? = null,
        @Query("skip") skip: Int? = null,
        @Query("limit") limit: Int? = null
    ): Response<List<Expense>>

    @POST("erp/expenses")
    suspend fun createExpense(@Body expense: ExpenseCreateRequest): Response<Expense>

    @POST("erp/expenses/{id}/decision")
    suspend fun decideExpense(@Path("id") id: String, @Body decision: ExpenseDecisionRequest): Response<Expense>

    // Leads
    @GET("erp/leads")
    suspend fun listLeads(
        @Query("branch_id") branchId: String? = null,
        @Query("counsellor_id") counsellorId: String? = null,
        @Query("status") status: String? = null,
        @Query("q") q: String? = null,
        @Query("search") search: String? = null,
        @Query("skip") skip: Int? = null,
        @Query("limit") limit: Int? = null
    ): Response<List<Lead>>

    @POST("erp/leads")
    suspend fun createLead(@Body lead: LeadCreateRequest): Response<Lead>

    @PATCH("erp/leads/{id}")
    suspend fun updateLead(@Path("id") id: String, @Body lead: LeadUpdateRequest): Response<Lead>

    @POST("erp/leads/{id}/propose")
    suspend fun proposeLead(@Path("id") id: String, @Body body: Map<String, Any>): Response<Lead>

    @POST("erp/leads/{id}/approve")
    suspend fun approveLead(@Path("id") id: String, @Body body: Map<String, Any>): Response<Lead>

    @POST("erp/leads/{id}/reject")
    suspend fun rejectLead(@Path("id") id: String, @Body body: Map<String, Any>): Response<Lead>

    @POST("erp/leads/{id}/enroll")
    suspend fun enrollLead(@Path("id") id: String, @Body body: Map<String, Any>): Response<Lead>

    @POST("erp/leads/{id}/transfer")
    suspend fun transferLead(@Path("id") id: String, @Body body: LeadTransferRequest): Response<Lead>

    // Staff
    @GET("erp/staff")
    suspend fun listStaff(@Query("branch_id") branchId: String? = null): Response<List<User>>

    @POST("erp/staff")
    suspend fun createStaff(@Body staff: StaffCreateRequest): Response<User>

    @PATCH("erp/staff/{id}")
    suspend fun updateStaff(@Path("id") id: String, @Body staff: StaffUpdateRequest): Response<User>

    @DELETE("erp/staff/{id}")
    suspend fun deleteStaff(@Path("id") id: String): Response<Unit>

    // Branches
    @GET("erp/branches")
    suspend fun listBranches(): Response<List<Branch>>

    @PATCH("erp/branches/{id}")
    suspend fun updateBranch(@Path("id") id: String, @Body branch: BranchUpdateRequest): Response<Branch>

    // Dashboard
    @GET("erp/dashboard/super")
    suspend fun superDashboard(): Response<DashboardSuperResponse>

    @GET("erp/dashboard/branch/{branch_id}")
    suspend fun branchDashboard(@Path("branch_id") branchId: String): Response<DashboardBranchResponse>

    // Attendance
    @GET("erp/erpattendance")
    suspend fun listAttendance(@Query("branch_id") branchId: String? = null): Response<List<AttendanceLog>>

    @POST("erp/erpattendance/scan")
    suspend fun scanAttendance(@Body req: AttendanceScanRequest): Response<AttendanceLog>

    @POST("erp/erpattendance/override")
    suspend fun overrideAttendance(@Body req: AttendanceOverrideRequest): Response<AttendanceLog>

    // Audit
    @GET("erp/audit")
    suspend fun auditLogs(@Query("branch_id") branchId: String? = null): Response<List<AuditLog>>

    // ID Cards
    @GET("erp/id-cards/queue")
    suspend fun idCardQueue(): Response<List<Map<String, Any>>>

    // Exports
    @GET("erp/exports/gst.xlsx")
    suspend fun exportGst(@Query("month") month: String? = null, @Query("branch_id") branchId: String? = null): Response<okhttp3.ResponseBody>

    @GET("erp/exports/payments.xlsx")
    suspend fun exportPayments(@Query("branch_id") branchId: String? = null): Response<okhttp3.ResponseBody>

    @GET("erp/exports/expenses.xlsx")
    suspend fun exportExpenses(@Query("branch_id") branchId: String? = null): Response<okhttp3.ResponseBody>

    @GET("erp/exports/students.xlsx")
    suspend fun exportStudents(@Query("branch_id") branchId: String? = null): Response<okhttp3.ResponseBody>
}

@JsonClass(generateAdapter = true)
data class StudentStatement(
    val student: Student,
    @Json(name = "total_fee") val totalFee: Double,
    @Json(name = "scholarship_percent") val scholarshipPercent: Double,
    @Json(name = "scholarship_amount") val scholarshipAmount: Double,
    val discount: Double = 0.0,
    @Json(name = "net_fee") val netFee: Double,
    @Json(name = "total_paid") val totalPaid: Double,
    val pending: Double,
    val payments: List<Payment> = emptyList()
)

@JsonClass(generateAdapter = true)
data class LookupResponse(
    val type: String,
    val data: Map<String, Any>? = null
)

@JsonClass(generateAdapter = true)
data class PhotoResponse(
    @Json(name = "photo_url") val photoUrl: String? = null
)

@JsonClass(generateAdapter = true)
data class LeadTransferRequest(
    @Json(name = "branch_id") val branchId: String,
    val notes: String? = null
)

@JsonClass(generateAdapter = true)
data class AuditLog(
    val id: String,
    @Json(name = "actor_id") val actorId: String? = null,
    @Json(name = "actor_email") val actorEmail: String? = null,
    @Json(name = "actor_role") val actorRole: String? = null,
    val action: String? = null,
    val entity: String? = null,
    @Json(name = "entity_id") val entityId: String? = null,
    @Json(name = "branch_id") val branchId: String? = null,
    val payload: Map<String, Any> = emptyMap(),
    @Json(name = "created_at") val createdAt: String? = null
)
