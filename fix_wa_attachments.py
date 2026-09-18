with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "r") as f:
    text = f.read()

# Add an attachment icon and modal sheet to ThreadDetailPane
if "var showAttachmentSheet by remember { mutableStateOf(false) }" not in text:
    detail_pane_original = """fun ThreadDetailPane(
    thread: com.northend.admin.domain.model.WhatsAppThread,
    messages: List<com.northend.admin.data.remote.models.WhatsAppMessage>,
    onSendMessage: (String) -> Unit,
    onBack: () -> Unit
) {"""
    
    detail_pane_new = """@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ThreadDetailPane(
    thread: com.northend.admin.domain.model.WhatsAppThread,
    messages: List<com.northend.admin.data.remote.models.WhatsAppMessage>,
    onSendMessage: (String) -> Unit,
    onBack: () -> Unit
) {
    var showAttachmentSheet by remember { mutableStateOf(false) }
"""
    text = text.replace(detail_pane_original, detail_pane_new)

    input_bar_original = """@Composable
fun ChatInputBar(onSend: (String) -> Unit) {
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

    input_bar_new = """@Composable
fun ChatInputBar(onSend: (String) -> Unit, onAttachClick: () -> Unit) {
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
    text = text.replace(input_bar_original, input_bar_new)

    text = text.replace("ChatInputBar(onSend = onSendMessage)", "ChatInputBar(onSend = onSendMessage, onAttachClick = { showAttachmentSheet = true })")

    attachment_sheet = """
        if (showAttachmentSheet) {
            ModalBottomSheet(onDismissRequest = { showAttachmentSheet = false }) {
                Column(modifier = Modifier.fillMaxWidth().padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Attach File", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(bottom = 16.dp))
                    Row(horizontalArrangement = Arrangement.SpaceEvenly, modifier = Modifier.fillMaxWidth()) {
                        AttachmentOption(Icons.Default.CameraAlt, "Camera") { showAttachmentSheet = false }
                        AttachmentOption(Icons.Default.Image, "Gallery") { showAttachmentSheet = false }
                        AttachmentOption(Icons.Default.Description, "Document") { showAttachmentSheet = false }
                    }
                    Spacer(modifier = Modifier.height(32.dp))
                }
            }
        }
"""
    text = text.replace("        LazyColumn(", attachment_sheet + "\n        LazyColumn(")

    if "fun AttachmentOption" not in text:
        text += """
@Composable
fun AttachmentOption(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, onClick: () -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(8.dp)) {
        IconButton(
            onClick = onClick,
            modifier = Modifier.background(MaterialTheme.colorScheme.secondaryContainer, shape = androidx.compose.foundation.shape.CircleShape).padding(8.dp)
        ) {
            Icon(icon, contentDescription = label, tint = MaterialTheme.colorScheme.onSecondaryContainer)
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(label, style = MaterialTheme.typography.bodySmall)
    }
}
"""
    
    text = text.replace("import androidx.compose.material.icons.filled.Send", "import androidx.compose.material.icons.filled.Send\nimport androidx.compose.material.icons.filled.AttachFile\nimport androidx.compose.material.icons.filled.CameraAlt\nimport androidx.compose.material.icons.filled.Image\nimport androidx.compose.material.icons.filled.Description")

with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "w") as f:
    f.write(text)
