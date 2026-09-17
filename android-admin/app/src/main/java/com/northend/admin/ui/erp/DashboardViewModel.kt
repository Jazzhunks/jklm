package com.northend.admin.ui.erp

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.northend.admin.data.local.TokenManager
import com.northend.admin.data.remote.AdminApiService
import com.northend.admin.data.repository.AdminRepository
import com.northend.admin.domain.model.User
import com.northend.admin.utils.ResultWrapper
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

data class DashboardUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val data: Any? = null,
    val isSuccess: Boolean = false
)

@HiltViewModel
class DashboardViewModel @Inject constructor(private val repository: AdminRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    val user = MutableStateFlow<User?>(null)

    init {
        load()
    }

    fun load() {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        viewModelScope.launch {
            val meResult = repository.getMe()
            if (meResult is ResultWrapper.Success) {
                user.value = meResult.data
                val role = meResult.data.role
                val dashboardResult = if (role == "super_admin" || role == "admin") {
                    repository.getSuperDashboard()
                } else {
                    val branchId = meResult.data.branchId ?: return@launch
                    repository.getBranchDashboard(branchId)
                }
                when (dashboardResult) {
                    is ResultWrapper.Success -> _uiState.value = _uiState.value.copy(isLoading = false, data = dashboardResult.data)
                    is ResultWrapper.Error -> _uiState.value = _uiState.value.copy(isLoading = false, error = dashboardResult.message)
                    else -> {}
                }
            } else if (meResult is ResultWrapper.Error) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = meResult.message)
            }
        }
    }
}
