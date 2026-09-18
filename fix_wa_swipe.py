with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "r") as f:
    text = f.read()

# Make sure we have the required imports
imports_to_add = [
    "androidx.compose.material3.SwipeToDismiss",
    "androidx.compose.material3.rememberDismissState",
    "androidx.compose.material3.DismissValue",
    "androidx.compose.material3.DismissDirection",
    "androidx.compose.ui.graphics.Color"
]

for imp in imports_to_add:
    if imp not in text:
        text = text.replace("import androidx.compose.material3.ExperimentalMaterial3Api", f"import {imp}\nimport androidx.compose.material3.ExperimentalMaterial3Api")

# Update ThreadListPane to use SwipeToDismiss
old_thread_list = """        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding).background(MaterialTheme.colorScheme.background),
            contentPadding = PaddingValues(bottom = 80.dp)
        ) {
            items(threads) { thread ->
                ThreadCard(
                    thread = thread,
                    isSelected = thread.id == selectedThreadId,
                    onClick = { onThreadSelect(thread) }
                )
            }
        }"""

new_thread_list = """        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding).background(MaterialTheme.colorScheme.background),
            contentPadding = PaddingValues(bottom = 80.dp)
        ) {
            items(threads, key = { it.id }) { thread ->
                val dismissState = rememberDismissState(
                    confirmValueChange = { dismissValue ->
                        if (dismissValue == DismissValue.DismissedToStart) {
                            // Swiped left - Archive
                            // Ideally call a ViewModel method here, for now just dismiss
                            true
                        } else if (dismissValue == DismissValue.DismissedToEnd) {
                            // Swiped right - Pin
                            false // Don't actually dismiss the item, just trigger action
                        } else {
                            false
                        }
                    }
                )

                SwipeToDismiss(
                    state = dismissState,
                    background = {
                        val direction = dismissState.dismissDirection ?: return@SwipeToDismiss
                        val color = when (direction) {
                            DismissDirection.StartToEnd -> Color(0xFF4CAF50) // Green for Pin
                            DismissDirection.EndToStart -> Color(0xFFE57373) // Red for Archive
                        }
                        val icon = when (direction) {
                            DismissDirection.StartToEnd -> Icons.Default.PushPin
                            DismissDirection.EndToStart -> Icons.Default.Archive
                        }
                        val alignment = when (direction) {
                            DismissDirection.StartToEnd -> Alignment.CenterStart
                            DismissDirection.EndToStart -> Alignment.CenterEnd
                        }
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(color)
                                .padding(horizontal = 20.dp),
                            contentAlignment = alignment
                        ) {
                            Icon(icon, contentDescription = null, tint = Color.White)
                        }
                    },
                    dismissContent = {
                        ThreadCard(
                            thread = thread,
                            isSelected = thread.id == selectedThreadId,
                            onClick = { onThreadSelect(thread) }
                        )
                    }
                )
            }
        }"""

text = text.replace(old_thread_list, new_thread_list)

# Add PushPin and Archive icons
if "Icons.Default.PushPin" not in text:
    text = text.replace("import androidx.compose.material.icons.filled.Send", "import androidx.compose.material.icons.filled.Send\nimport androidx.compose.material.icons.filled.PushPin\nimport androidx.compose.material.icons.filled.Archive")

with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "w") as f:
    f.write(text)

