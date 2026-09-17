import re

# Patch ExpensesScreen.kt
with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/erp/ExpensesScreen.kt', 'r') as f:
    expenses_code = f.read()

expenses_add_dialog = """
    if (showAddDialog) {
        var category by remember { mutableStateOf("") }
        var amount by remember { mutableStateOf("") }
        var desc by remember { mutableStateOf("") }
        var branchId by remember { mutableStateOf("") }
        
        AlertDialog(
            onDismissRequest = { showAddDialog = false },
            title = { Text("Add Expense") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(value = branchId, onValueChange = { branchId = it }, label = { Text("Branch ID") })
                    OutlinedTextField(value = category, onValueChange = { category = it }, label = { Text("Category") })
                    OutlinedTextField(value = amount, onValueChange = { amount = it }, label = { Text("Amount") })
                    OutlinedTextField(value = desc, onValueChange = { desc = it }, label = { Text("Description") })
                }
            },
            confirmButton = {
                Button(onClick = { 
                    viewModel.createExpense(branchId, category, amount.toDoubleOrNull() ?: 0.0, desc)
                    showAddDialog = false 
                }) { Text("Save") }
            },
            dismissButton = {
                TextButton(onClick = { showAddDialog = false }) { Text("Cancel") }
            }
        )
    }
}
"""

expenses_code = expenses_code.replace("""
    if (showAddDialog) {
        showAddDialog = false
    }
}
""", expenses_add_dialog)

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/erp/ExpensesScreen.kt', 'w') as f:
    f.write(expenses_code)

# Patch ExpensesViewModel.kt
with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/erp/ExpensesViewModel.kt', 'r') as f:
    expenses_vm_code = f.read()

expenses_vm_add = """
    fun createExpense(branchId: String, category: String, amount: Double, desc: String) {
        viewModelScope.launch {
            val req = com.northend.admin.data.remote.models.ExpenseCreateRequest(
                branchId = branchId, category = category, amount = amount, description = desc
            )
            val res = repository.createExpense(req)
            if (res is ResultWrapper.Success) {
                load()
            } else if (res is ResultWrapper.Error) {
                _uiState.value = _uiState.value.copy(error = res.message)
            }
        }
    }
}
"""
expenses_vm_code = expenses_vm_code.replace("}\n", expenses_vm_add, 1)

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/erp/ExpensesViewModel.kt', 'w') as f:
    f.write(expenses_vm_code)

print("Expenses patched.")
