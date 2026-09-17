package com.northend.admin.data.repository

import com.northend.admin.data.local.TokenManager
import com.northend.admin.data.remote.AdminApiService
import com.northend.admin.data.remote.LoginRequest
import com.northend.admin.data.remote.RefreshRequest
import com.northend.admin.data.remote.models.ExpenseCreateRequest
import com.northend.admin.data.remote.models.ExpenseDecisionRequest
import com.northend.admin.data.remote.models.LeadCreateRequest
import com.northend.admin.data.remote.models.LeadUpdateRequest
import com.northend.admin.data.remote.models.PaymentCreateRequest
import com.northend.admin.domain.model.Student
import com.northend.admin.domain.model.Payment
import com.northend.admin.domain.model.Expense
import com.northend.admin.domain.model.Lead
import com.northend.admin.domain.model.DashboardSuperResponse
import com.northend.admin.domain.model.DashboardBranchResponse
import com.northend.admin.domain.model.MetaResponse
import com.northend.admin.domain.model.User
import com.northend.admin.utils.ResultWrapper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AdminRepository @Inject constructor(
    private val apiService: AdminApiService,
    private val tokenManager: TokenManager
) {

    suspend fun login(email: String, password: String): ResultWrapper<User> = withContext(Dispatchers.IO) {
        try {
            val res = apiService.login(LoginRequest(email, password))
            if (res.isSuccessful) {
                val body = res.body()!!
                tokenManager.saveTokens(body.accessToken, body.refreshToken)
                ResultWrapper.Success(body.user)
            } else {
                ResultWrapper.Error(res.message() ?: "Login failed")
            }
        } catch (e: Exception) {
            ResultWrapper.Error(e.localizedMessage ?: "Network error")
        }
    }

    suspend fun refreshToken(): ResultWrapper<String> = withContext(Dispatchers.IO) {
        val refresh = tokenManager.getRefreshToken() ?: return@withContext ResultWrapper.Error("No refresh token")
        try {
            val res = apiService.refresh(RefreshRequest(refresh))
            if (res.isSuccessful) {
                val body = res.body()!!
                tokenManager.saveTokens(body.accessToken, body.refreshToken ?: refresh)
                ResultWrapper.Success(body.accessToken)
            } else {
                tokenManager.clearTokens()
                ResultWrapper.Error("Session expired")
            }
        } catch (e: Exception) {
            tokenManager.clearTokens()
            ResultWrapper.Error(e.localizedMessage ?: "Refresh failed")
        }
    }

    suspend fun sendOtp(identifier: String, action: String = "login"): ResultWrapper<com.northend.admin.data.remote.SendOtpResponse> =
        safeApiCall { apiService.sendOtp(com.northend.admin.data.remote.SendOtpRequest(identifier, action)).body()!! }

    suspend fun verifyOtp(identifier: String, code: String, action: String = "login"): ResultWrapper<com.northend.admin.data.remote.LoginResponse> =
        safeApiCall {
            val response = apiService.verifyOtp(com.northend.admin.data.remote.VerifyOtpRequest(identifier, code, action)).body()!!
            tokenManager.saveTokens(response.accessToken, response.refreshToken)
            response
        }

    suspend fun getMe(): ResultWrapper<User> = safeApiCall { apiService.me().body()!! }

    suspend fun getStudents(branchId: String? = null, query: String? = null): ResultWrapper<List<Student>> =
        safeApiCall { apiService.listStudents(branchId = branchId, q = query, search = query).body()!! }

    suspend fun createStudent(student: com.northend.admin.data.remote.models.Student): ResultWrapper<Student> =
        safeApiCall { apiService.createStudent(student).body()!! }

    suspend fun getPayments(branchId: String? = null, query: String? = null): ResultWrapper<List<Payment>> =
        safeApiCall { apiService.listPayments(branchId = branchId, search = query).body()!! }

    suspend fun createPayment(payment: PaymentCreateRequest): ResultWrapper<Payment> =
        safeApiCall { apiService.createPayment(payment).body()!! }

    suspend fun getExpenses(branchId: String? = null, status: String? = null): ResultWrapper<List<Expense>> =
        safeApiCall { apiService.listExpenses(branchId = branchId, status = status).body()!! }

    suspend fun createExpense(expense: ExpenseCreateRequest): ResultWrapper<Expense> =
        safeApiCall { apiService.createExpense(expense).body()!! }

    suspend fun decideExpense(id: String, decision: String, note: String? = null): ResultWrapper<Expense> =
        safeApiCall { apiService.decideExpense(id, ExpenseDecisionRequest(decision, note)).body()!! }

    suspend fun getLeads(branchId: String? = null, status: String? = null): ResultWrapper<List<Lead>> =
        safeApiCall { apiService.listLeads(branchId = branchId, status = status).body()!! }

    suspend fun createLead(lead: LeadCreateRequest): ResultWrapper<Lead> =
        safeApiCall { apiService.createLead(lead).body()!! }

    suspend fun updateLead(id: String, lead: LeadUpdateRequest): ResultWrapper<Lead> =
        safeApiCall { apiService.updateLead(id, lead).body()!! }

    suspend fun getSuperDashboard(): ResultWrapper<DashboardSuperResponse> =
        safeApiCall { apiService.superDashboard().body()!! }

    suspend fun getBranchDashboard(branchId: String): ResultWrapper<DashboardBranchResponse> =
        safeApiCall { apiService.branchDashboard(branchId).body()!! }


    suspend fun listWhatsAppThreads(): ResultWrapper<List<com.northend.admin.data.remote.models.WhatsAppThread>> =
        safeApiCall { apiService.listWhatsAppThreads().body()!! }

    suspend fun getWhatsAppMessages(threadId: String): ResultWrapper<List<com.northend.admin.data.remote.models.WhatsAppMessage>> =
        safeApiCall { apiService.getWhatsAppMessages(threadId).body()!! }

    suspend fun sendWhatsAppMessage(threadId: String, text: String): ResultWrapper<com.northend.admin.data.remote.models.WhatsAppMessage> =
        safeApiCall { apiService.sendWhatsAppMessage(threadId, com.northend.admin.data.remote.models.WhatsAppSendMessageRequest(text = text)).body()!! }

    suspend fun getMeta(): ResultWrapper<com.northend.admin.data.remote.MetaResponse> =
        safeApiCall { apiService.meta().body()!! }

    suspend fun logout(): ResultWrapper<Unit> = safeApiCall {
        apiService.logout()
        tokenManager.clearTokens()
    }

    private suspend fun <T> safeApiCall(apiCall: suspend () -> T): ResultWrapper<T> = withContext(Dispatchers.IO) {
        try {
            ResultWrapper.Success(apiCall())
        } catch (e: Exception) {
            ResultWrapper.Error(e.localizedMessage ?: "Unknown error")
        }
    }
}
