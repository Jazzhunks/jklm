package com.northend.admin.ui.erp

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.northend.admin.domain.model.Payment
import com.northend.admin.ui.components.ErrorView
import com.northend.admin.ui.components.LoadingIndicator

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PaymentsScreen(viewModel: PaymentsViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Fee Collections") }) },
        floatingActionButton = {
            FloatingActionButton(onClick = { showAddDialog = true }) {
                Icon(Icons.Default.Add, contentDescription = "Add")
            }
        }
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding)) {
            if (state.isLoading) {
                LoadingIndicator()
            } else if (state.error != null) {
                ErrorView(state.error!!, onRetry = { viewModel.load() })
            } else {
                LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(state.payments) { payment ->
                        PaymentCard(payment)
                    }
                }
            }
        }
    }

    if (showAddDialog) {
        showAddDialog = false
    }
}

@Composable
private fun PaymentCard(payment: Payment) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = payment.receiptNo ?: payment.id, style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = com.northend.admin.utils.Formatters.fmtINR(payment.amount), style = MaterialTheme.typography.bodyLarge)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = "Mode: ${payment.mode}", style = MaterialTheme.typography.bodySmall)
            payment.paidAt?.let {
                Text(text = "Paid at: $it", style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}
