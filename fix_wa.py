with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "r") as f:
    text = f.read()

# Add missing import for AnimatedPane
text = text.replace("import androidx.compose.material3.adaptive.layout.ListDetailPaneScaffold",
"""import androidx.compose.material3.adaptive.layout.ListDetailPaneScaffold
import androidx.compose.material3.adaptive.layout.AnimatedPane""")

# Fix signature
text = text.replace("""fun WhatsAppInboxScreen(
    viewModel: WhatsAppViewModel = hiltViewModel(),
    onBack: () -> Unit = {}
)""", """fun WhatsAppInboxScreen(
    targetThreadId: String? = null,
    onLogout: () -> Unit = {},
    viewModel: WhatsAppViewModel = hiltViewModel(),
    onBack: () -> Unit = {}
)""")

with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "w") as f:
    f.write(text)
