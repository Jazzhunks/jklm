package com.northend.admin.ui.erp

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.northend.admin.data.repository.AdminRepository
import com.northend.admin.domain.model.Student
import com.northend.admin.utils.ResultWrapper
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class StudentsUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val students: List<Student> = emptyList()
)

@HiltViewModel
class StudentsViewModel @Inject constructor(
    private val repository: AdminRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(StudentsUiState())
    val uiState: StateFlow<StudentsUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        viewModelScope.launch {
            when (val result = repository.getStudents()) {
                is ResultWrapper.Success -> _uiState.value = _uiState.value.copy(isLoading = false, students = result.data)
                is ResultWrapper.Error -> _uiState.value = _uiState.value.copy(isLoading = false, error = result.message)
                else -> {}
            }
        }
    }

    fun createFullStudent(fullName: String, phone: String, courseId: String, branchId: String, parentName: String, email: String, gender: String) {
        viewModelScope.launch {
            val req = com.northend.admin.data.remote.models.Student(
                id = "", fullName = fullName, contactPhone = phone, courseId = courseId, branchId = branchId, parentName = parentName, contactEmail = email, gender = gender
            )
            val res = repository.createStudent(req)
            if (res is ResultWrapper.Success) {
                load()
            } else if (res is ResultWrapper.Error) {
                _uiState.value = _uiState.value.copy(error = res.message)
            }
        }
    }
}
