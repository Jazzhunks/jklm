with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "r") as f:
    text = f.read()

import re

# Find the start of MessageInput
start_idx = text.find("fun MessageInput(onSend: (String) -> Unit) {")

if start_idx != -1:
    end_idx = text.find("fun AttachmentOption(", start_idx)
    if end_idx == -1:
        end_idx = len(text)
    
    old_msg = text[start_idx:end_idx]
    
    new_msg = """fun MessageInput(onSend: (String) -> Unit, onAttachClick: () -> Unit = {}) {
    var text by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf("") }
    
    Surface(
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 2.dp
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onAttachClick) {
                Icon(Icons.Default.AttachFile, contentDescription = "Attach", tint = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            OutlinedTextField(
                value = text,
                onValueChange = { text = it },
                modifier = Modifier.weight(1f),
                placeholder = { Text("Type a message...") },
                shape = androidx.compose.foundation.shape.RoundedCornerShape(24.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            IconButton(
                onClick = {
                    if (text.isNotBlank()) {
                        onSend(text)
                        text = ""
                    }
                },
                modifier = Modifier.background(MaterialTheme.colorScheme.primary, shape = androidx.compose.foundation.shape.CircleShape)
            ) {
                Icon(Icons.Default.Send, contentDescription = "Send", tint = MaterialTheme.colorScheme.onPrimary)
            }
        }
    }
}

"""
    text = text[:start_idx] + new_msg + text[end_idx:]

with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "w") as f:
    f.write(text)

