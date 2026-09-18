with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "r") as f:
    text = f.read()

# Add the variable inside ThreadDetailPane
target = """fun ThreadDetailPane(
    thread: WhatsAppThread,
    messages: List<WhatsAppMessage>,
    onBack: () -> Unit,
    onSendMessage: (String) -> Unit
) {"""
replacement = """fun ThreadDetailPane(
    thread: WhatsAppThread,
    messages: List<WhatsAppMessage>,
    onBack: () -> Unit,
    onSendMessage: (String) -> Unit
) {
    var showAttachmentSheet by remember { mutableStateOf(false) }"""

text = text.replace(target, replacement)

# Add the @Composable for AttachmentOption
if "fun AttachmentOption(" not in text:
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

with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "w") as f:
    f.write(text)
