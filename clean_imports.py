with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "r") as f:
    lines = f.readlines()

bad_imports = [
    "import androidx.compose.material3.SwipeToDismiss",
    "import androidx.compose.material3.rememberDismissState",
    "import androidx.compose.material3.DismissValue",
    "import androidx.compose.material3.DismissDirection"
]

new_lines = []
for line in lines:
    if not any(bad in line for bad in bad_imports):
        new_lines.append(line)

with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "w") as f:
    f.writelines(new_lines)

