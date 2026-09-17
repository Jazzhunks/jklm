package com.northend.admin.ui.erp

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.northend.admin.domain.model.Expense
import com.northend.admin.ui.components.ErrorView
import com.northend.admin.ui.components.LoadingIndicator

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExpensesScreen(viewModel: ExpensesViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsState()
    var showAddSheet by remember { mutableStateOf(false) }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Expenses") }) },
        floatingActionButton = {
            FloatingActionButton(onClick = { showAddSheet = true }) {
                Icon(Icons.Default.Add, contentDescription = "Add Expense")
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
                    items(state.expenses) { expense ->
                        ExpenseCard(expense)
                    }
                }
            }
        }
    }

    if (showAddSheet) {
        ModalBottomSheet(
            onDismissRequest = { showAddSheet = false },
            modifier = Modifier.fillMaxHeight(0.9f)
        ) {
            AddExpenseForm(
                onSave = { branchId, category, amount, desc, vendor, pMode ->
                    viewModel.createFullExpense(branchId, category, amount, desc, vendor, pMode)
                    showAddSheet = false
                },
                onCancel = { showAddSheet = false }
            )
        }
    }
}

@Composable
fun AddExpenseForm(
    onSave: (String, String, Double, String, String, String) -> Unit,
    onCancel: () -> Unit
) {
    var branchId by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("") }
    var amount by remember { mutableStateOf("") }
    var desc by remember { mutableStateOf("") }
    var vendor by remember { mutableStateOf("") }
    var pMode by remember { mutableStateOf("online") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Log New Expense", style = MaterialTheme.typography.titleLarge)
        
        OutlinedTextField(value = branchId, onValueChange = { branchId = it }, label = { Text("Branch ID *") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = category, onValueChange = { category = it }, label = { Text("Category (e.g. Salary, Rent) *") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = amount, onValueChange = { amount = it }, label = { Text("Amount *") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = vendor, onValueChange = { vendor = it }, label = { Text("Vendor Name") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = pMode, onValueChange = { pMode = it }, label = { Text("Payment Mode") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(
            value = desc, 
            onValueChange = { desc = it }, 
            label = { Text("Description *") }, 
            modifier = Modifier.fillMaxWidth().height(100.dp),
            maxLines = 4
        )

        Spacer(modifier = Modifier.height(16.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
            TextButton(onClick = onCancel) { Text("Cancel") }
            Spacer(modifier = Modifier.width(8.dp))
            Button(
                onClick = { onSave(branchId, category, amount.toDoubleOrNull() ?: 0.0, desc, vendor, pMode) },
                enabled = branchId.isNotBlank() && category.isNotBlank() && amount.isNotBlank() && desc.isNotBlank()
            ) {
                Text("Log Expense")
            }
        }
        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
private fun ExpenseCard(expense: Expense) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = expense.category, style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = "Amount: ₹${expense.amount}", style = MaterialTheme.typography.bodyLarge)
            Text(text = expense.description, style = MaterialTheme.typography.bodySmall)
            if (!expense.vendor.isNullOrBlank()) {
                Text(text = "Vendor: ${expense.vendor}", style = MaterialTheme.typography.bodySmall)
            }
            Text(text = "Status: ${expense.status ?: "pending"}", style = MaterialTheme.typography.labelSmall)
        }
    }
}
