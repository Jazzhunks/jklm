package com.northend.admin.ui.erp

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.northend.admin.data.repository.AdminRepository
import com.northend.admin.domain.model.Payment
import com.northend.admin.utils.ResultWrapper
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class PaymentsUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val payments: List<Payment> = emptyList()
)

@HiltViewModel
class PaymentsViewModel @Inject constructor(
    private val repository: AdminRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(PaymentsUiState())
    val uiState: StateFlow<PaymentsUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        viewModelScope.launch {
            when (val result = repository.getPayments()) {
                is ResultWrapper.Success -> _uiState.value = _uiState.value.copy(isLoading = false, payments = result.data)
                is ResultWrapper.Error -> _uiState.value = _uiState.value.copy(isLoading = false, error = result.message)
                else -> {}
            }
        }
    }
}
