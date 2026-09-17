with open('android-admin/app/src/main/java/com/northend/admin/ui/MainActivity.kt', 'r') as f:
    main = f.read()

if "AppNavHost()" not in main:
    main = """package com.northend.admin.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.core.view.WindowCompat
import com.northend.admin.ui.theme.NorthEndTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        setContent {
            NorthEndTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppNavHost()
                }
            }
        }
    }
}
"""
    with open('android-admin/app/src/main/java/com/northend/admin/ui/MainActivity.kt', 'w') as f:
        f.write(main)
    print("Restored native MainActivity")
else:
    print("Already native")
