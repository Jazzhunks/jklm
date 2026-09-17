with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/auth/LoginScreen.kt', 'r') as f:
    code = f.read()

new_ui = """
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
"""

# Extract the part between Column { and if (state.error != null)
start = code.find('Text(\n                    text = "NorthEnd Admin"')
end = code.find('if (state.error != null) {')

if start != -1 and end != -1:
    code = code[:start] + new_ui + "                " + code[end:]

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/auth/LoginScreen.kt', 'w') as f:
    f.write(code)

print("LoginScreen patched")
