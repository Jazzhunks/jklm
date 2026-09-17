package com.northend.admin.ui

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.webkit.*
import android.webkit.SslErrorHandler
import android.webkit.ConsoleMessage
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.view.WindowCompat
import com.northend.admin.ui.theme.NorthEndTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    private var initialUrl = "https://northendedu.com/"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Make the app render edge-to-edge for a native feel
        WindowCompat.setDecorFitsSystemWindows(window, false)

        // Handle URL routing from Push Notifications
        handleIntent(intent)

        setContent {
            NorthEndTheme {
                Surface(color = MaterialTheme.colorScheme.background) {
                    HybridWebAppScreen(initialUrl)
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
        // If the app was already open, we might want to trigger a JS navigation or reload, 
        // but for now, recreating the activity or relying on the user's current state is okay.
    }

    private fun handleIntent(intent: Intent) {
        val targetPath = intent.getStringExtra("target_path")
        if (!targetPath.isNullOrEmpty()) {
            initialUrl = "https://northendedu.com$targetPath"
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun HybridWebAppScreen(startUrl: String) {
    var webView by remember { mutableStateOf<WebView?>(null) }
    
    BackHandler(enabled = webView?.canGoBack() == true) {
        webView?.goBack()
    }

    AndroidView(
        modifier = Modifier.fillMaxSize().systemBarsPadding(),
        factory = { context ->
            WebView(context).apply {
                layoutParams = android.view.ViewGroup.LayoutParams(
                    android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                    android.view.ViewGroup.LayoutParams.MATCH_PARENT
                )
                
                overScrollMode = WebView.OVER_SCROLL_NEVER
                isVerticalScrollBarEnabled = false
                isHorizontalScrollBarEnabled = false
                
                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    databaseEnabled = true
                    cacheMode = WebSettings.LOAD_DEFAULT
                    useWideViewPort = true
                    loadWithOverviewMode = true
                    setSupportZoom(false)
                    builtInZoomControls = false
                    displayZoomControls = false
                    mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                }

                webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                        val url = request?.url.toString()
                        if (url.contains("northendedu.com") || url.startsWith("/")) {
                            return false
                        }
                        try {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                            context.startActivity(intent)
                        } catch (e: Exception) {}
                        return true
                    }

                    @SuppressLint("WebViewClientOnReceivedSslError")
                    override fun onReceivedSslError(view: WebView?, handler: SslErrorHandler?, error: android.net.http.SslError?) {
                        handler?.proceed() // Ignore SSL certificate errors for preview domains
                    }
                }
                
                webChromeClient = object : WebChromeClient() {
                    override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                        android.util.Log.d("WebViewConsole", consoleMessage?.message() ?: "")
                        return true
                    }
                }
                
                loadUrl(startUrl)
                webView = this
            }
        },
        update = {
            webView = it
        }
    )
}
