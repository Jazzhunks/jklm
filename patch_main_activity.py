with open('android-admin/app/src/main/java/com/northend/admin/ui/MainActivity.kt', 'r') as f:
    main = f.read()

new_main = """package com.northend.admin.ui

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.core.view.WindowCompat
import com.northend.admin.ui.theme.NorthEndTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    private val targetThreadId = mutableStateOf<String?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        handleIntent(intent)

        setContent {
            NorthEndTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppNavHost(targetThreadId = targetThreadId.value)
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent) {
        val targetPath = intent.getStringExtra("target_path")
        // Expected format: /admin/whatsapp?thread_id=123
        if (targetPath != null && targetPath.contains("thread_id=")) {
            targetThreadId.value = targetPath.split("thread_id=")[1]
        }
    }
}
"""
with open('android-admin/app/src/main/java/com/northend/admin/ui/MainActivity.kt', 'w') as f:
    f.write(new_main)
print("MainActivity patched")
