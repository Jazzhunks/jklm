with open('android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt', 'r') as f:
    screen = f.read()

if "import androidx.activity.compose.BackHandler" not in screen:
    screen = screen.replace('import androidx.compose.runtime.*', 'import androidx.compose.runtime.*\nimport androidx.activity.compose.BackHandler')

screen = screen.replace('val state by viewModel.uiState.collectAsState()', '''val state by viewModel.uiState.collectAsState()

    BackHandler(enabled = state.currentThread != null) {
        viewModel.deselectThread()
    }''')

with open('android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt', 'w') as f:
    f.write(screen)
