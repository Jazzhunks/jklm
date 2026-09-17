package com.northend.admin.ui.erp

import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.northend.admin.data.local.TokenManager
import com.northend.admin.data.remote.AdminApiService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class IdCardsUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val queue: List<Map<String, Any>> = emptyList()
)


@HiltViewModel
class IdCardsViewModel @Inject constructor(private val apiService: AdminApiService, private val tokenManager: TokenManager) : ViewModel() {

    private val _uiState = MutableStateFlow(IdCardsUiState())
    val uiState: StateFlow<IdCardsUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        viewModelScope.launch {
            try {
                val res = apiService.idCardQueue()
                if (res.isSuccessful) {
                    _uiState.value = _uiState.value.copy(isLoading = false, queue = res.body() ?: emptyList())
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false, error = res.message())
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.localizedMessage)
            }
        }
    }
}
