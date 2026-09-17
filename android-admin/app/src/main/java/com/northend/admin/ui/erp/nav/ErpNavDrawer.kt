package com.northend.admin.ui.erp.nav

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.LocationCity
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Message
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination

object ErpDestinations {
    const val WATH = "wath"
    const val SCHOLARSHIPS = "scholarships"
    const val GALLERY = "gallery"
    const val DASHBOARD = "dashboard"
    const val STUDENTS = "students"
    const val PAYMENTS = "payments"
    const val EXPENSES = "expenses"
    const val LEADS = "leads"
    const val STAFF = "staff"
    const val BRANCHES = "branches"
    const val ATTENDANCE = "attendance"
    const val AUDIT = "audit"
    const val ID_CARDS = "idcards"
    const val WHATSAPP = "whatsapp"
}

@Composable
fun ErpDrawerItems(role: String, currentRoute: androidx.navigation.NavDestination?, onNavigate: (String) -> Unit) {
    val items = buildList {
        add(DrawerItem(ErpDestinations.DASHBOARD, "Dashboard", Icons.Default.Dashboard) { true })
        add(DrawerItem(ErpDestinations.WATH, "WATH Exams", Icons.Default.Assignment) { true })
        add(DrawerItem(ErpDestinations.SCHOLARSHIPS, "Scholarships", Icons.Default.School) { true })
        add(DrawerItem(ErpDestinations.GALLERY, "Gallery", Icons.Default.Dashboard) { true })
        if (role in listOf("super_admin", "admin", "center_manager", "accountant")) {
            add(DrawerItem(ErpDestinations.STUDENTS, "Students", Icons.Default.School) { true })
        }
        if (role in listOf("super_admin", "admin", "center_manager", "accountant")) {
            add(DrawerItem(ErpDestinations.PAYMENTS, "Fee Collections", Icons.Default.Receipt) { true })
            add(DrawerItem(ErpDestinations.EXPENSES, "Expenses", Icons.Default.AccountBalanceWallet) { true })
        }
        if (role in listOf("super_admin", "admin", "center_manager", "accountant", "counsellor")) {
            add(DrawerItem(ErpDestinations.LEADS, "Leads", Icons.Default.PersonAdd) { true })
        }
        if (role in listOf("super_admin", "admin", "center_manager")) {
            add(DrawerItem(ErpDestinations.STAFF, "Staff", Icons.Default.People) { true })
        }
        if (role == "super_admin" || role == "admin") {
            add(DrawerItem(ErpDestinations.BRANCHES, "Branches", Icons.Default.LocationCity) { true })
            add(DrawerItem(ErpDestinations.AUDIT, "Audit Log", Icons.Default.Assignment) { true })
            add(DrawerItem(ErpDestinations.ID_CARDS, "ID Cards", Icons.Default.Badge) { true })
        }
        add(DrawerItem(ErpDestinations.WHATSAPP, "WhatsApp Inbox", Icons.Default.Message) { true })
        add(DrawerItem(ErpDestinations.ATTENDANCE, "Gate Attendance", Icons.Default.QrCodeScanner) { true })
    }

    items.forEach { item ->
        val selected = currentRoute?.hierarchy?.any { it.route == item.route } == true
        NavigationDrawerItem(
            label = { Text(item.label) },
            selected = selected,
            onClick = { onNavigate(item.route) },
            icon = { androidx.compose.material3.Icon(item.icon, contentDescription = item.label) }
        )
    }
}

data class DrawerItem(val route: String, val label: String, val icon: androidx.compose.ui.graphics.vector.ImageVector, val show: () -> Boolean)
