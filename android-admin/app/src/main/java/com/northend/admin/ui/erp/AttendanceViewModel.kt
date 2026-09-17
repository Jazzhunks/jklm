package com.northend.admin.ui.erp

import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.northend.admin.data.local.TokenManager
import com.northend.admin.data.remote.AdminApiService
import com.northend.admin.domain.model.AttendanceLog
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AttendanceUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val logs: List<AttendanceLog> = emptyList()
)


@HiltViewModel
class AttendanceViewModel @Inject constructor(private val apiService: AdminApiService, private val tokenManager: TokenManager) : ViewModel() {

    private val _uiState = MutableStateFlow(AttendanceUiState())
    val uiState: StateFlow<AttendanceUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        viewModelScope.launch {
            try {
                val res = apiService.listAttendance()
                if (res.isSuccessful) {
                    val mapped = res.body()?.map { AttendanceLog(it.id, it.studentId, it.studentNo, it.fullName, it.batch, it.branchId, it.status, it.mode, it.deviceSignature, it.scannedAt) } ?: emptyList()
                    _uiState.value = _uiState.value.copy(isLoading = false, logs = mapped)
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false, error = res.message())
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.localizedMessage)
            }
        }
    }
}
