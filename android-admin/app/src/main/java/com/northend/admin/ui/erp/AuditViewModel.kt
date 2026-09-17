package com.northend.admin.ui.erp

import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.northend.admin.data.local.TokenManager
import com.northend.admin.data.remote.AdminApiService
import com.northend.admin.domain.model.AuditLog
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AuditUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val logs: List<AuditLog> = emptyList()
)


@HiltViewModel
class AuditViewModel @Inject constructor(private val apiService: AdminApiService, private val tokenManager: TokenManager) : ViewModel() {

    private val _uiState = MutableStateFlow(AuditUiState())
    val uiState: StateFlow<AuditUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        viewModelScope.launch {
            try {
                val res = apiService.auditLogs()
                if (res.isSuccessful) {
                    _uiState.value = _uiState.value.copy(isLoading = false, logs = res.body() ?: emptyList())
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false, error = res.message())
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.localizedMessage)
            }
        }
    }
}
