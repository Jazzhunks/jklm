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
import com.northend.admin.domain.model.Student
import com.northend.admin.ui.components.ErrorView
import com.northend.admin.ui.components.LoadingIndicator

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StudentsScreen(viewModel: StudentsViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsState()
    var showAddSheet by remember { mutableStateOf(false) }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Students") }) },
        floatingActionButton = {
            FloatingActionButton(onClick = { showAddSheet = true }) {
                Icon(Icons.Default.Add, contentDescription = "Add Student")
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
                    items(state.students) { student ->
                        StudentCard(student)
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
            AddStudentForm(
                onSave = { fullName, phone, courseId, branchId, parentName, email, gender ->
                    viewModel.createFullStudent(fullName, phone, courseId, branchId, parentName, email, gender)
                    showAddSheet = false
                },
                onCancel = { showAddSheet = false }
            )
        }
    }
}

@Composable
fun AddStudentForm(
    onSave: (String, String, String, String, String, String, String) -> Unit,
    onCancel: () -> Unit
) {
    var fullName by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var courseId by remember { mutableStateOf("") }
    var branchId by remember { mutableStateOf("") }
    var parentName by remember { mutableStateOf("") }
    var gender by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Add New Student", style = MaterialTheme.typography.titleLarge)
        
        OutlinedTextField(value = fullName, onValueChange = { fullName = it }, label = { Text("Full Name *") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = phone, onValueChange = { phone = it }, label = { Text("Contact Phone *") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email Address") }, modifier = Modifier.fillMaxWidth())
        
        OutlinedTextField(value = courseId, onValueChange = { courseId = it }, label = { Text("Course ID *") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = branchId, onValueChange = { branchId = it }, label = { Text("Branch ID *") }, modifier = Modifier.fillMaxWidth())
        
        OutlinedTextField(value = parentName, onValueChange = { parentName = it }, label = { Text("Parent Name") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = gender, onValueChange = { gender = it }, label = { Text("Gender") }, modifier = Modifier.fillMaxWidth())

        Spacer(modifier = Modifier.height(16.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
            TextButton(onClick = onCancel) { Text("Cancel") }
            Spacer(modifier = Modifier.width(8.dp))
            Button(
                onClick = { onSave(fullName, phone, courseId, branchId, parentName, email, gender) },
                enabled = fullName.isNotBlank() && phone.isNotBlank() && courseId.isNotBlank() && branchId.isNotBlank()
            ) {
                Text("Save Student")
            }
        }
        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
private fun StudentCard(student: Student) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = student.fullName, style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = "Course: ${student.courseId}", style = MaterialTheme.typography.bodyMedium)
            Text(text = "Phone: ${student.contactPhone}", style = MaterialTheme.typography.bodySmall)
            Text(text = "Branch: ${student.branchId}", style = MaterialTheme.typography.bodySmall)
            if (!student.parentName.isNullOrBlank()) {
                Text(text = "Parent: ${student.parentName}", style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}
