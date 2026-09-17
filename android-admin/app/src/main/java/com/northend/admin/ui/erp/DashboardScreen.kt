package com.northend.admin.ui.erp

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.northend.admin.domain.model.DashboardSuperResponse
import com.northend.admin.ui.components.ErrorView
import com.northend.admin.ui.components.LoadingIndicator
import com.northend.admin.ui.theme.NorthEndTheme
import com.northend.admin.utils.Formatters
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun DashboardScreen(viewModel: DashboardViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val user by viewModel.user.collectAsStateWithLifecycle()

    NorthEndTheme {
        Surface(modifier = Modifier.fillMaxSize()) {
            when {
                state.isLoading -> LoadingIndicator()
                state.error != null -> ErrorView(state.error!!, onRetry = { viewModel.load() })
                state.data != null -> {
                    val data = state.data!!
                    if (user?.role in listOf("super_admin", "admin") && data is DashboardSuperResponse) {
                        SuperDashboardContent(data)
                    } else if (data is com.northend.admin.domain.model.DashboardBranchResponse) {
                        BranchDashboardContent(data)
                    } else {
                        Text("No dashboard data")
                    }
                }
            }
        }
    }
}

@Composable
private fun SuperDashboardContent(data: DashboardSuperResponse) {
    LazyColumn(modifier = Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text(text = "Executive Dashboard", style = MaterialTheme.typography.headlineSmall)
        }
        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatCard(title = "Revenue", value = Formatters.fmtINR(data.totalRevenue), modifier = Modifier.weight(1f))
                StatCard(title = "Expense", value = Formatters.fmtINR(data.totalExpense), modifier = Modifier.weight(1f))
            }
        }
        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatCard(title = "Net Income", value = Formatters.fmtINR(data.netIncome), modifier = Modifier.weight(1f))
                StatCard(title = "Pending Fees", value = Formatters.fmtINR(data.totalPendingFees), modifier = Modifier.weight(1f))
            }
        }
        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatCard(title = "Students", value = data.totalStudents.toString(), modifier = Modifier.weight(1f))
                StatCard(title = "Branches", value = data.totalBranches.toString(), modifier = Modifier.weight(1f))
            }
        }
        item {
            Text(text = "Branch Performance", style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(8.dp))
        }
        items(data.branches) { branch ->
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = branch.branchName ?: branch.branchId, style = MaterialTheme.typography.titleSmall)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                        Text("Revenue: ${Formatters.fmtINR(branch.revenue)}")
                        Text("Expense: ${Formatters.fmtINR(branch.expense)}")
                        Text("Net: ${Formatters.fmtINR(branch.net)}")
                        Text("Students: ${branch.students}")
                    }
                }
            }
        }
    }
}

@Composable
private fun BranchDashboardContent(data: com.northend.admin.domain.model.DashboardBranchResponse) {
    LazyColumn(modifier = Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text(text = data.branch?.name ?: "Branch Dashboard", style = MaterialTheme.typography.headlineSmall)
        }
        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatCard(title = "Revenue", value = Formatters.fmtINR(data.revenue), modifier = Modifier.weight(1f))
                StatCard(title = "Expense", value = Formatters.fmtINR(data.expense), modifier = Modifier.weight(1f))
            }
        }
        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatCard(title = "Pending Fees", value = Formatters.fmtINR(data.pendingFees), modifier = Modifier.weight(1f))
                StatCard(title = "Students", value = data.studentCount.toString(), modifier = Modifier.weight(1f))
                StatCard(title = "Leads", value = data.leadCount.toString(), modifier = Modifier.weight(1f))
            }
        }
        item {
            Text(text = "Recent Payments", style = MaterialTheme.typography.titleMedium)
        }
        items(data.recentPayments) { payment ->
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = payment.receiptNo ?: payment.id, style = MaterialTheme.typography.titleSmall)
                    Text(text = Formatters.fmtINR(payment.amount), style = MaterialTheme.typography.bodyLarge)
                }
            }
        }
    }
}

@Composable
private fun StatCard(title: String, value: String, modifier: Modifier = Modifier) {
    Card(modifier = modifier) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = title, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = value, style = MaterialTheme.typography.headlineSmall)
        }
    }
}
