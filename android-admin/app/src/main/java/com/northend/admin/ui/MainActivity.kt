package com.northend.admin.ui

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.activity.enableEdgeToEdge
import com.northend.admin.ui.theme.NorthEndTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    private val targetThreadId = mutableStateOf<String?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
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
        setIntent(intent) // Security Skill: keep active references updated
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent) {
        try {
            val targetPath = intent.getStringExtra("target_path")
            // Expected format: /admin/whatsapp?thread_id=123
            if (targetPath != null && targetPath.contains("thread_id=")) {
                val parts = targetPath.split("thread_id=")
                if (parts.size > 1 && parts[1].isNotEmpty()) {
                    targetThreadId.value = parts[1]
                }
            }
        } catch (e: Exception) {
            // Handle missing or malformed intent extras gracefully to prevent crashes
        }
    }
}
