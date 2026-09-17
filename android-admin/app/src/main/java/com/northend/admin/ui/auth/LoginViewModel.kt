package com.northend.admin.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.northend.admin.data.repository.AdminRepository
import com.northend.admin.domain.model.User
import com.northend.admin.utils.ResultWrapper
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

data class LoginUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val isSuccess: Boolean = false
)

@HiltViewModel
class LoginViewModel @Inject constructor(private val repository: AdminRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    fun login(email: String, password: String) {
        _uiState.value = LoginUiState(isLoading = true, error = null)
        viewModelScope.launch {
            when (val result = repository.login(email, password)) {
                is ResultWrapper.Success<*> -> {
                    _uiState.value = LoginUiState(isLoading = false, isSuccess = true)
                }
                is ResultWrapper.Error -> {
                    _uiState.value = LoginUiState(isLoading = false, error = result.message)
                }
                else -> {}
            }
        }
    }

    fun sendOtp(identifier: String) {
        _uiState.value = LoginUiState(isLoading = true, error = null)
        viewModelScope.launch {
            when (val result = repository.sendOtp(identifier)) {
                is ResultWrapper.Success<*> -> {
                    _uiState.value = LoginUiState(isLoading = false, isSuccess = false)
                }
                is ResultWrapper.Error -> {
                    _uiState.value = LoginUiState(isLoading = false, error = result.message)
                }
                else -> {}
            }
        }
    }

    fun verifyOtp(identifier: String, code: String) {
        _uiState.value = LoginUiState(isLoading = true, error = null)
        viewModelScope.launch {
            when (val result = repository.verifyOtp(identifier, code)) {
                is ResultWrapper.Success<*> -> {
                    _uiState.value = LoginUiState(isLoading = false, isSuccess = true)
                }
                is ResultWrapper.Error -> {
                    _uiState.value = LoginUiState(isLoading = false, error = result.message)
                }
                else -> {}
            }
        }
    }
}

class AuthViewModel(private val tokenManager: com.northend.admin.data.local.TokenManager, private val repository: AdminRepository) : ViewModel() {

    fun isLoggedIn(): Boolean = tokenManager.isLoggedIn()

    fun logout() {
        viewModelScope.launch {
            repository.logout()
        }
    }
}
