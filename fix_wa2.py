with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "r") as f:
    text = f.read()

text = text.replace("import androidx.compose.material3.adaptive.layout.ListDetailPaneScaffoldRole",
"""import androidx.compose.material3.adaptive.layout.ThreePaneScaffoldRole
import androidx.compose.material3.adaptive.ExperimentalMaterial3AdaptiveApi
import androidx.compose.material3.adaptive.layout.AnimatedPane""")

text = text.replace("ListDetailPaneScaffoldRole.Detail", "ThreePaneScaffoldRole.Primary")

with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "w") as f:
    f.write(text)
