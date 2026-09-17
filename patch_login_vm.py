import re

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/auth/LoginViewModel.kt', 'r') as f:
    vm = f.read()

vm_methods = """
    fun sendOtp(identifier: String) {
        _uiState.value = LoginUiState(isLoading = true, error = null)
        viewModelScope.launch {
            when (val result = repository.sendOtp(identifier)) {
                is ResultWrapper.Success -> {
                    _uiState.value = LoginUiState(isLoading = false, isSuccess = false) // Wait for OTP
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
                is ResultWrapper.Success -> {
                    _uiState.value = LoginUiState(isLoading = false, isSuccess = true)
                }
                is ResultWrapper.Error -> {
                    _uiState.value = LoginUiState(isLoading = false, error = result.message)
                }
                else -> {}
            }
        }
    }
"""

vm = vm.rsplit('}', 2)[0] + vm_methods + "}\n\n" + vm.rsplit('}', 2)[1] + "}\n"

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/auth/LoginViewModel.kt', 'w') as f:
    f.write(vm)

print("LoginViewModel patched")
