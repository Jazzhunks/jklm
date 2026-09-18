with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppViewModel.kt", "r") as f:
    text = f.read()

text = text.replace("fun clearThread()", "fun deselectThread()")

text = text.replace("fun sendMessage(threadId: String, content: String) {", """fun loadThreads() {
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
""")

with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppViewModel.kt", "w") as f:
    f.write(text)
