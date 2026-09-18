import re

with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "r") as f:
    text = f.read()

# Remove the incorrectly inserted sheets
bad_sheet = """
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
text = text.replace(bad_sheet, "")

# Now insert it ONLY inside ThreadDetailPane, right before LazyColumn
# ThreadDetailPane has a Scaffold...
# Let's use regex to find ThreadDetailPane's LazyColumn.

target = "    ) { padding ->\n        LazyColumn("
replacement = "    ) { padding ->\n" + bad_sheet + "        LazyColumn("
text = text.replace(target, replacement)

with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "w") as f:
    f.write(text)
