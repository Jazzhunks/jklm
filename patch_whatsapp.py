with open('android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt', 'r') as f:
    wa = f.read()

# Fix signature
wa = wa.replace('fun WhatsAppInboxScreen(viewModel: WhatsAppViewModel = hiltViewModel()) {', 'fun WhatsAppInboxScreen(viewModel: WhatsAppViewModel = hiltViewModel(), targetThreadId: String? = null, onLogout: () -> Unit = {}) {')

# Add LaunchedEffect for targetThreadId
effect = """
    LaunchedEffect(targetThreadId, state.threads) {
        if (targetThreadId != null && state.threads.isNotEmpty()) {
            val target = state.threads.find { it.id == targetThreadId }
            if (target != null && state.currentThread?.id != targetThreadId) {
                viewModel.selectThread(target)
            }
        }
    }
    
    // Auto-fetch token and update on backend on launch of inbox
    LaunchedEffect(Unit) {
        try {
            com.google.firebase.messaging.FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    val token = task.result
                    android.util.Log.d("FCM", "Fetched token: $token")
                    // Instead of creating a new API in WhatsAppViewModel, we can do it via a quick side-effect or we need to add it to WhatsAppViewModel.
                    // Actually, DashboardViewModel was calling this. I'll add `updateFcmToken` to WhatsAppViewModel.
                }
            }
        } catch(e: Exception) {}
    }
"""
wa = wa.replace('val state by viewModel.uiState.collectAsState()', 'val state by viewModel.uiState.collectAsState()\n' + effect)

# Add logout button
old_top = """TopAppBar(
                    title = { Text("WhatsApp", color = Color.White, fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold) },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = com.northend.admin.ui.theme.WhatsAppTeal)
                )"""
new_top = """TopAppBar(
                    title = { Text("WhatsApp", color = Color.White, fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold) },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = com.northend.admin.ui.theme.WhatsAppTeal),
                    actions = {
                        IconButton(onClick = onLogout) {
                            Icon(androidx.compose.material.icons.Icons.Filled.ExitToApp, "Logout", tint = Color.White)
                        }
                    }
                )"""
wa = wa.replace(old_top, new_top)

if "androidx.compose.material.icons.filled.ExitToApp" not in wa:
    wa = wa.replace("import androidx.compose.material.icons.filled.ArrowBack", "import androidx.compose.material.icons.filled.ArrowBack\nimport androidx.compose.material.icons.filled.ExitToApp")

with open('android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt', 'w') as f:
    f.write(wa)
print("WhatsAppInboxScreen patched")
