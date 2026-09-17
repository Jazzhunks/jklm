package com.northend.admin.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.northend.admin.ui.components.ErrorView
import com.northend.admin.ui.components.LoadingIndicator
import com.northend.admin.ui.theme.NorthEndTheme
import com.northend.admin.utils.Formatters
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun LoginScreen(
    viewModel: LoginViewModel,
    onLoginSuccess: () -> Unit
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    LaunchedEffect(state.isSuccess) {
        if (state.isSuccess) {
            onLoginSuccess()
        }
    }

    NorthEndTheme {
        Surface(modifier = Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                
                var useOtp by remember { mutableStateOf(false) }
                var identifier by remember { mutableStateOf("") }
                var otpCode by remember { mutableStateOf("") }
                var otpSent by remember { mutableStateOf(false) }

                Text(
                    text = "NorthEnd Admin",
                    style = MaterialTheme.typography.headlineMedium
                )
                Spacer(modifier = Modifier.height(32.dp))
                
                if (!useOtp) {
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Email") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text("Password") },
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                } else {
                    OutlinedTextField(
                        value = identifier,
                        onValueChange = { identifier = it },
                        label = { Text("Email or Phone Number") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    if (otpSent) {
                        Spacer(modifier = Modifier.height(16.dp))
                        OutlinedTextField(
                            value = otpCode,
                            onValueChange = { otpCode = it },
                            label = { Text("6-Digit OTP") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(24.dp))
                
                if (state.isLoading) {
                    LoadingIndicator()
                } else {
                    if (!useOtp) {
                        Button(
                            onClick = { viewModel.login(email, password) },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = email.isNotBlank() && password.isNotBlank()
                        ) {
                            Text("Login with Password")
                        }
                    } else {
                        if (!otpSent) {
                            Button(
                                onClick = { 
                                    viewModel.sendOtp(identifier)
                                    otpSent = true
                                },
                                modifier = Modifier.fillMaxWidth(),
                                enabled = identifier.isNotBlank()
                            ) {
                                Text("Send OTP")
                            }
                        } else {
                            Button(
                                onClick = { viewModel.verifyOtp(identifier, otpCode) },
                                modifier = Modifier.fillMaxWidth(),
                                enabled = otpCode.length == 6
                            ) {
                                Text("Verify & Login")
                            }
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                TextButton(onClick = { useOtp = !useOtp }) {
                    Text(if (useOtp) "Use Password Instead" else "Login with OTP Instead")
                }
                if (state.error != null) {
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(text = state.error!!, color = MaterialTheme.colorScheme.error)
                }
            }
        }
    }
}
