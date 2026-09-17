with open('android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppViewModel.kt', 'r') as f:
    vm = f.read()

polling = """
    init {
        loadThreads()
        startPolling()
    }

    private fun startPolling() {
        viewModelScope.launch {
            while(true) {
                kotlinx.coroutines.delay(3000)
                if (_uiState.value.currentThread == null) {
                    val threadsResult = repository.getWhatsAppThreads()
                    if (threadsResult is com.northend.admin.utils.ResultWrapper.Success) {
                        _uiState.value = _uiState.value.copy(threads = threadsResult.data)
                    }
                } else {
                    val msgsResult = repository.getWhatsAppMessages(_uiState.value.currentThread!!.id)
                    if (msgsResult is com.northend.admin.utils.ResultWrapper.Success) {
                        _uiState.value = _uiState.value.copy(messages = msgsResult.data)
                    }
                }
            }
        }
    }
"""

vm = vm.replace('init {\n        loadThreads()\n    }', polling)

with open('android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppViewModel.kt', 'w') as f:
    f.write(vm)
