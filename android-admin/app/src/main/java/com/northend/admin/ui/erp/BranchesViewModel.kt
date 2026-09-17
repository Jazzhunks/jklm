package com.northend.admin.ui.erp

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.northend.admin.data.local.TokenManager
import com.northend.admin.data.remote.AdminApiService
import com.northend.admin.domain.model.Branch
import com.northend.admin.utils.ResultWrapper
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class BranchesUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val branches: List<Branch> = emptyList()
)

@HiltViewModel
class BranchesViewModel @Inject constructor(
    private val apiService: AdminApiService,
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(BranchesUiState())
    val uiState: StateFlow<BranchesUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val res = apiService.listBranches()
                if (res.isSuccessful) {
                    val mapped = res.body()?.map { Branch(it.id, it.name, it.code, it.city, it.address, it.phone) } ?: emptyList()
                    _uiState.update { it.copy(isLoading = false, branches = mapped) }
                } else {
                    _uiState.update { it.copy(isLoading = false, error = res.message()) }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = e.localizedMessage) }
            }
        }
    }
}
