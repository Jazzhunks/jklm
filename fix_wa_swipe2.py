with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "r") as f:
    text = f.read()

# Remove the broken imports
text = text.replace("import androidx.compose.material.icons.filled.PushPin\n", "")
text = text.replace("import androidx.compose.material.icons.filled.Archive\n", "")

# Add the new imports if not present
if "import androidx.compose.material.icons.filled.Star" not in text:
    text = text.replace("import androidx.compose.material.icons.filled.Send", "import androidx.compose.material.icons.filled.Send\nimport androidx.compose.material.icons.filled.Star\nimport androidx.compose.material.icons.filled.Delete")

# Replace PushPin and Archive
text = text.replace("Icons.Default.PushPin", "Icons.Default.Star")
text = text.replace("Icons.Default.Archive", "Icons.Default.Delete")

with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "w") as f:
    f.write(text)
