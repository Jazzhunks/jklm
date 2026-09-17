package com.northend.admin.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.northend.admin.data.local.TokenManager
import com.northend.admin.domain.model.User
import com.northend.admin.ui.auth.LoginScreen
import com.northend.admin.ui.auth.LoginViewModel
import com.northend.admin.ui.erp.DashboardViewModel
import com.northend.admin.ui.erp.ErpScreen
import com.northend.admin.di.NetworkModule

@Composable
fun AppNavHost() {
    val navController = rememberNavController()
    var startDestination by remember { mutableStateOf("login") }

    val context = LocalContext.current
    val tokenManager = remember { NetworkModule.provideTokenManager(context) }

    LaunchedEffect(Unit) {
        startDestination = if (tokenManager.isLoggedIn()) "erp" else "login"
    }

    NavHost(navController = navController, startDestination = startDestination) {
        composable("login") {
            val viewModel: LoginViewModel = hiltViewModel()
            LoginScreen(viewModel = viewModel, onLoginSuccess = {
                navController.navigate("erp") {
                    popUpTo("login") { inclusive = true }
                }
            })
        }
        composable("erp") {
            val dashboardViewModel: DashboardViewModel = androidx.hilt.navigation.compose.hiltViewModel()
            val user by dashboardViewModel.user.collectAsStateWithLifecycle()
            val currentUser = user ?: User(id = "", name = "", email = "", role = "attendance")
            ErpScreen(
                user = currentUser,
                onLogout = {
                    tokenManager.clearTokens()
                    navController.navigate("login") {
                        popUpTo("erp") { inclusive = true }
                    }
                }
            )
        }
    }
}
