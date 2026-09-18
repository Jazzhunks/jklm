with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "import androidx.compose.material3.adaptive" in line:
        pass
    else:
        new_lines.append(line)

imports = """
import androidx.compose.material3.adaptive.ExperimentalMaterial3AdaptiveApi
import androidx.compose.material3.adaptive.layout.ListDetailPaneScaffold
import androidx.compose.material3.adaptive.layout.ListDetailPaneScaffoldRole
import androidx.compose.material3.adaptive.navigation.rememberListDetailPaneScaffoldNavigator
"""
new_lines.insert(10, imports)

text = "".join(new_lines)
text = text.replace("androidx.compose.material3.adaptive.layout.ThreePaneScaffoldRole.Primary", "ListDetailPaneScaffoldRole.Detail")

with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "w") as f:
    f.write(text)

