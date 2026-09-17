package com.northend.admin.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.northend.admin.data.local.TokenManager
import com.northend.admin.ui.auth.LoginScreen
import com.northend.admin.ui.auth.LoginViewModel
import com.northend.admin.di.NetworkModule
import com.northend.admin.ui.erp.WhatsAppInboxScreen

@Composable
fun AppNavHost(targetThreadId: String? = null) {
    val navController = rememberNavController()
    
    val context = LocalContext.current
    val tokenManager = remember { NetworkModule.provideTokenManager(context) }
    val startDestination = remember { if (tokenManager.isLoggedIn()) "whatsapp" else "login" }


    NavHost(navController = navController, startDestination = startDestination) {
        composable("login") {
            val viewModel: LoginViewModel = hiltViewModel()
            LoginScreen(viewModel = viewModel, onLoginSuccess = {
                navController.navigate("whatsapp") {
                    popUpTo("login") { inclusive = true }
                }
            })
        }
        composable("whatsapp") {
            WhatsAppInboxScreen(
                targetThreadId = targetThreadId,
                onLogout = {
                    tokenManager.clearTokens()
                    navController.navigate("login") {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }
    }
}
