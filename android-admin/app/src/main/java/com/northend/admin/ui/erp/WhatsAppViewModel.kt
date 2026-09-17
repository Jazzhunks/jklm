package com.northend.admin.ui.erp

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.northend.admin.data.remote.models.WhatsAppMessage
import com.northend.admin.data.remote.models.WhatsAppThread
import com.northend.admin.data.repository.AdminRepository
import com.northend.admin.utils.ResultWrapper
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class WhatsAppUiState(
    val isLoadingThreads: Boolean = false,
    val isLoadingMessages: Boolean = false,
    val error: String? = null,
    val threads: List<WhatsAppThread> = emptyList(),
    val currentThread: WhatsAppThread? = null,
    val messages: List<WhatsAppMessage> = emptyList()
)

@HiltViewModel
class WhatsAppViewModel @Inject constructor(
    private val repository: AdminRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(WhatsAppUiState())
    val uiState: StateFlow<WhatsAppUiState> = _uiState.asStateFlow()

    init {
        loadThreads()
    }

    fun loadThreads() {
        _uiState.value = _uiState.value.copy(isLoadingThreads = true, error = null)
        viewModelScope.launch {
            when (val res = repository.listWhatsAppThreads()) {
                is ResultWrapper.Success -> _uiState.value = _uiState.value.copy(isLoadingThreads = false, threads = res.data)
                is ResultWrapper.Error -> _uiState.value = _uiState.value.copy(isLoadingThreads = false, error = res.message)
                else -> {}
            }
        }
    }

    fun selectThread(thread: WhatsAppThread) {
        _uiState.value = _uiState.value.copy(currentThread = thread, isLoadingMessages = true)
        viewModelScope.launch {
            when (val res = repository.getWhatsAppMessages(thread.id)) {
                is ResultWrapper.Success -> _uiState.value = _uiState.value.copy(isLoadingMessages = false, messages = res.data)
                is ResultWrapper.Error -> _uiState.value = _uiState.value.copy(isLoadingMessages = false, error = res.message)
                else -> {}
            }
        }
    }

    fun deselectThread() {
        _uiState.value = _uiState.value.copy(currentThread = null, messages = emptyList())
        loadThreads()
    }

    fun sendMessage(text: String) {
        val threadId = _uiState.value.currentThread?.id ?: return
        viewModelScope.launch {
            when (val res = repository.sendWhatsAppMessage(threadId, text)) {
                is ResultWrapper.Success -> {
                    val updatedMsgs = _uiState.value.messages + res.data
                    _uiState.value = _uiState.value.copy(messages = updatedMsgs)
                }
                is ResultWrapper.Error -> _uiState.value = _uiState.value.copy(error = res.message)
                else -> {}
            }
        }
    }
}
