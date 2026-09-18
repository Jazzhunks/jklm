with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "r") as f:
    text = f.read()

# Replace MessageInput usage
text = text.replace("MessageInput(onSend = onSendMessage)", "MessageInput(onSend = onSendMessage, onAttachClick = { showAttachmentSheet = true })")

# Replace MessageInput definition
old_msg_input = """@Composable
fun MessageInput(onSend: (String) -> Unit) {
    var text by remember { mutableStateOf("") }
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        OutlinedTextField(
            value = text,
            onValueChange = { text = it },
            modifier = Modifier.weight(1f),
            placeholder = { Text("Message") },
            shape = MaterialTheme.shapes.extraLarge
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
}"""

new_msg_input = """@Composable
fun MessageInput(onSend: (String) -> Unit, onAttachClick: () -> Unit) {
    var text by remember { mutableStateOf("") }
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        IconButton(onClick = onAttachClick) {
            Icon(Icons.Default.AttachFile, contentDescription = "Attach", tint = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        OutlinedTextField(
            value = text,
            onValueChange = { text = it },
            modifier = Modifier.weight(1f),
            placeholder = { Text("Message") },
            shape = MaterialTheme.shapes.extraLarge
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
}"""

text = text.replace(old_msg_input, new_msg_input)

with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "w") as f:
    f.write(text)

