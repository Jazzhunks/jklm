with open('android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt', 'r') as f:
    ui = f.read()

# 1. Update ThreadItem
old_thread_item = """fun ThreadItem(thread: WhatsAppThread, onClick: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().clickable { onClick() }.padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier.size(50.dp).clip(androidx.compose.foundation.shape.CircleShape).background(Color.LightGray),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Filled.Person, contentDescription = null, tint = Color.White, modifier = Modifier.size(32.dp))
        }
        Spacer(modifier = Modifier.width(16.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = thread.contactName ?: thread.studentName ?: thread.phone ?: "Unknown",
                fontWeight = androidx.compose.ui.text.font.FontWeight.Bold,
                fontSize = androidx.compose.ui.unit.sp.16,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = thread.lastMessagePreview ?: "",
                fontSize = androidx.compose.ui.unit.sp.14,
                color = Color.Gray,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}"""

# Actually, the best way to do this without strict string matching issues is to use regex or rewrite ThreadItem.
