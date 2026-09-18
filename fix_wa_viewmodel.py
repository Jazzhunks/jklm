with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppViewModel.kt", "r") as f:
    text = f.read()

import_statement = "import java.util.UUID\nimport java.time.Instant\nimport java.time.format.DateTimeFormatter\nimport java.time.ZoneOffset\nimport com.northend.admin.data.repository.ResultWrapper"

if "java.util.UUID" not in text:
    text = text.replace("import javax.inject.Inject", "import javax.inject.Inject\n" + import_statement)

# Replace the stub sendMessage
sendMessage_stub = """    fun sendMessage(content: String) {
        val threadId = _uiState.value.currentThread?.id ?: return
        viewModelScope.launch {
            // Optimistic UI logic goes here later
        }
    }"""

sendMessage_impl = """    fun sendMessage(content: String) {
        val threadId = _uiState.value.currentThread?.id ?: return
        
        // 1. Optimistic UI insertion
        val tempId = "temp_${UUID.randomUUID()}"
        val now = DateTimeFormatter.ISO_INSTANT.format(Instant.now().atOffset(ZoneOffset.UTC))
        val optimisticMessage = WhatsAppMessage(
            id = tempId,
            threadId = threadId,
            direction = "outbound",
            kind = "text",
            text = content,
            status = "sending",
            timestamp = now
        )
        
        // Append locally to state instantly to avoid waiting for Room (Optional, but Room Flow is fast enough)
        // We can just rely on the Flow if we inject the DAO or have a repo method, but right now AdminRepository 
        // doesn't expose `insertLocalMessage`. Let's just use the API and trigger sync.
        
        viewModelScope.launch {
            // We append it to the current state instantly for real Optimistic UI
            val currentMessages = _uiState.value.messages.toMutableList()
            currentMessages.add(0, optimisticMessage) // Assuming reversed list
            _uiState.value = _uiState.value.copy(messages = currentMessages)
            
            // 2. Network call
            val result = repository.sendWhatsAppMessage(threadId, content)
            
            // 3. Sync from network
            if (result is ResultWrapper.Success) {
                repository.syncWhatsAppMessages(threadId)
                repository.syncWhatsAppThreads()
            } else {
                // In a full implementation, we'd mark the message as failed
                _uiState.value = _uiState.value.copy(error = "Failed to send message")
            }
        }
    }"""

text = text.replace(sendMessage_stub, sendMessage_impl)

with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppViewModel.kt", "w") as f:
    f.write(text)
