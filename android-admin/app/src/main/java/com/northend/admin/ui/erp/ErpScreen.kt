package com.northend.admin.ui.erp

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.LocationCity
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.rememberDrawerState
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.northend.admin.ui.erp.nav.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ErpScreen(user: com.northend.admin.domain.model.User, onLogout: () -> Unit) {
    val navController = rememberNavController()
    val role = user.role ?: "attendance"
    val startDestination = when (role) {
        "attendance" -> ErpDestinations.ATTENDANCE
        else -> ErpDestinations.DASHBOARD
    }
    
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: "NorthEnd Admin"
    val titleText = currentRoute.replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet {
                Spacer(modifier = Modifier.height(16.dp))
                Text(text = "NorthEnd Admin", modifier = Modifier.padding(horizontal = 16.dp), style = MaterialTheme.typography.titleMedium)
                Text(text = user.name, modifier = Modifier.padding(horizontal = 16.dp), style = MaterialTheme.typography.bodySmall)
                Text(text = role.replace("_", " "), modifier = Modifier.padding(horizontal = 16.dp), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(modifier = Modifier.height(16.dp))
                ErpDrawerItems(role = role, currentRoute = navBackStackEntry?.destination, onNavigate = {
                    navController.navigate(it) {
                        popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                    scope.launch { drawerState.close() }
                })
                Spacer(modifier = Modifier.height(8.dp))
                Divider()
                NavigationDrawerItem(
                    label = { Text("Sign out") },
                    selected = false,
                    onClick = onLogout,
                    icon = { Icon(Icons.Default.Logout, contentDescription = null) }
                )
            }
        }
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text(titleText) },
                    navigationIcon = {
                        IconButton(onClick = { scope.launch { drawerState.open() } }) {
                            Icon(Icons.Default.Menu, contentDescription = "Menu")
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer,
                        titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                )
            }
        ) { paddingValues ->
            NavHost(navController = navController, startDestination = startDestination, modifier = Modifier.padding(paddingValues)) {
                composable(ErpDestinations.DASHBOARD) { DashboardScreen() }
                composable(ErpDestinations.STUDENTS) { StudentsScreen() }
                composable(ErpDestinations.PAYMENTS) { PaymentsScreen() }
                composable(ErpDestinations.EXPENSES) { ExpensesScreen() }
                composable(ErpDestinations.LEADS) { LeadsScreen() }
                composable(ErpDestinations.STAFF) { StaffScreen() }
                composable(ErpDestinations.BRANCHES) { BranchesScreen() }
                composable(com.northend.admin.ui.erp.nav.ErpDestinations.WHATSAPP) { com.northend.admin.ui.erp.WhatsAppInboxScreen() }
                    composable(ErpDestinations.ATTENDANCE) { AttendanceScreen() }
                    composable(ErpDestinations.WATH) { WathScreen() }
                    composable(ErpDestinations.SCHOLARSHIPS) { ScholarshipsScreen() }
                    composable(ErpDestinations.GALLERY) { GalleryScreen() }

                composable(ErpDestinations.AUDIT) { AuditScreen() }
                composable(ErpDestinations.ID_CARDS) { IdCardsScreen() }
            }
        }
    }
}
