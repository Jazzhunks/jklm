package com.northend.admin.ui.erp

import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.northend.admin.data.local.TokenManager
import com.northend.admin.data.remote.AdminApiService
import com.northend.admin.domain.model.User
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class StaffUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val staff: List<User> = emptyList()
)


@HiltViewModel
class StaffViewModel @Inject constructor(private val apiService: AdminApiService, private val tokenManager: TokenManager) : ViewModel() {

    private val _uiState = MutableStateFlow(StaffUiState())
    val uiState: StateFlow<StaffUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        viewModelScope.launch {
            try {
                val res = apiService.listStaff()
                if (res.isSuccessful) {
                    val mapped = res.body()?.map { User(it.id, it.name, it.email, it.role, it.branchId) } ?: emptyList()
                    _uiState.value = _uiState.value.copy(isLoading = false, staff = mapped)
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false, error = res.message())
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.localizedMessage)
            }
        }
    }
}
