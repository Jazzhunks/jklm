package com.northend.admin.ui.erp

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.northend.admin.data.remote.models.WhatsAppMessage
import com.northend.admin.data.remote.models.WhatsAppThread
import com.northend.admin.data.repository.AdminRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject
import java.util.UUID
import java.time.Instant
import java.time.format.DateTimeFormatter
import java.time.ZoneOffset
import com.northend.admin.utils.ResultWrapper

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
        observeLocalThreads()
        viewModelScope.launch {
            repository.syncWhatsAppThreads()
        }
    }

    private fun observeLocalThreads() {
        viewModelScope.launch {
            repository.getLocalWhatsAppThreads().collectLatest { entities ->
                val models = entities.map {
                    WhatsAppThread(it.id, it.phone, it.contactName, it.studentName, it.lastMessagePreview, it.lastMessageAt, it.unreadCount, emptyList())
                }
                _uiState.value = _uiState.value.copy(threads = models)
            }
        }
    }

    fun selectThread(thread: WhatsAppThread) {
        _uiState.value = _uiState.value.copy(currentThread = thread)
        observeLocalMessages(thread.id)
        viewModelScope.launch {
            repository.syncWhatsAppMessages(thread.id)
        }
    }

    private fun observeLocalMessages(threadId: String) {
        viewModelScope.launch {
            repository.getLocalWhatsAppMessages(threadId).collectLatest { entities ->
                val models = entities.map {
                    WhatsAppMessage(it.id, it.threadId, it.direction, it.kind, it.text, it.status, it.timestamp)
                }
                _uiState.value = _uiState.value.copy(messages = models)
            }
        }
    }

    fun deselectThread() {
        _uiState.value = _uiState.value.copy(currentThread = null, messages = emptyList())
    }

    fun loadThreads() {
        viewModelScope.launch {
            repository.syncWhatsAppThreads()
        }
    }
    
    fun updateFcmToken(token: String) {
        // Mock
    }

    fun sendMessage(content: String) {
        val threadId = _uiState.value.currentThread?.id ?: return
        viewModelScope.launch {
            // Optimistic UI logic goes here later
        }

        // Optimistic UI can be implemented here by saving to Room immediately
    }
}
