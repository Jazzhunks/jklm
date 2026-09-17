import re

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/erp/StudentsScreen.kt', 'r') as f:
    code = f.read()

dialog_code = """
    if (showAddDialog) {
        var fullName by remember { mutableStateOf("") }
        var phone by remember { mutableStateOf("") }
        var courseId by remember { mutableStateOf("") }
        var branchId by remember { mutableStateOf("") }
        
        AlertDialog(
            onDismissRequest = { showAddDialog = false },
            title = { Text("Add Student") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(value = fullName, onValueChange = { fullName = it }, label = { Text("Full Name") })
                    OutlinedTextField(value = phone, onValueChange = { phone = it }, label = { Text("Phone") })
                    OutlinedTextField(value = courseId, onValueChange = { courseId = it }, label = { Text("Course ID") })
                    OutlinedTextField(value = branchId, onValueChange = { branchId = it }, label = { Text("Branch ID") })
                }
            },
            confirmButton = {
                Button(onClick = { 
                    viewModel.createStudent(fullName, phone, courseId, branchId)
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

code = code.replace("""
    if (showAddDialog) {
        // Placeholder for create/edit bottom sheet
        showAddDialog = false
    }
}
""", dialog_code)

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/erp/StudentsScreen.kt', 'w') as f:
    f.write(code)

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/erp/StudentsViewModel.kt', 'r') as f:
    vm = f.read()

vm_add = """
    fun createStudent(fullName: String, phone: String, courseId: String, branchId: String) {
        viewModelScope.launch {
            val req = com.northend.admin.data.remote.models.Student(
                id = "", fullName = fullName, contactPhone = phone, courseId = courseId, branchId = branchId
            )
            val res = repository.createStudent(req)
            if (res is ResultWrapper.Success) {
                load()
            } else if (res is ResultWrapper.Error) {
                _uiState.value = _uiState.value.copy(error = res.message)
            }
        }
    }
"""

# safely insert before the final brace
vm = vm.rsplit("}", 1)[0] + vm_add + "}\n"

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/erp/StudentsViewModel.kt', 'w') as f:
    f.write(vm)

print("Students patched.")
