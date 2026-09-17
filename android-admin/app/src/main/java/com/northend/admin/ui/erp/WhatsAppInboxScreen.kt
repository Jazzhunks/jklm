package com.northend.admin.ui.erp

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.northend.admin.data.remote.models.WhatsAppMessage
import com.northend.admin.data.remote.models.WhatsAppThread
import com.northend.admin.ui.components.ErrorView
import com.northend.admin.ui.components.LoadingIndicator

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WhatsAppInboxScreen(viewModel: WhatsAppViewModel = hiltViewModel(), targetThreadId: String? = null, onLogout: () -> Unit = {}) {
    val state by viewModel.uiState.collectAsState()

    LaunchedEffect(targetThreadId, state.threads) {
        if (targetThreadId != null && state.threads.isNotEmpty()) {
            val target = state.threads.find { it.id == targetThreadId }
            if (target != null && state.currentThread?.id != targetThreadId) {
                viewModel.selectThread(target)
            }
        }
    }
    
    // Auto-fetch token and update on backend on launch of inbox
    LaunchedEffect(Unit) {
        try {
            com.google.firebase.messaging.FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    val token = task.result
                    android.util.Log.d("FCM", "Fetched token: $token")
                    // Instead of creating a new API in WhatsAppViewModel, we can do it via a quick side-effect or we need to add it to WhatsAppViewModel.
                    viewModel.updateFcmToken(token)
                }
            }
        } catch(e: Exception) {}
    }


    if (state.currentThread == null) {
        Scaffold(
            topBar = { TopAppBar(title = { Text("WhatsApp Inbox") }) }
        ) { padding ->
            Column(modifier = Modifier.fillMaxSize().padding(padding)) {
                if (state.isLoadingThreads) {
                    LoadingIndicator()
                } else if (state.error != null) {
                    ErrorView(state.error!!, onRetry = { viewModel.loadThreads() })
                } else {
                    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(state.threads) { thread ->
                            ThreadCard(thread) { viewModel.selectThread(it) }
                        }
                    }
                }
            }
        }
    } else {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text(state.currentThread!!.contactName ?: state.currentThread!!.phone ?: "Unknown Number") },
                    navigationIcon = {
                        IconButton(onClick = { viewModel.deselectThread() }) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                        }
                    }
                )
            },
            bottomBar = {
                MessageInput { text -> viewModel.sendMessage(text) }
            }
        ) { padding ->
            Column(modifier = Modifier.fillMaxSize().padding(padding)) {
                if (state.isLoadingMessages) {
                    LoadingIndicator()
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        reverseLayout = false
                    ) {
                        items(state.messages) { msg ->
                            MessageBubble(msg)
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ThreadCard(thread: WhatsAppThread, onClick: (WhatsAppThread) -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable { onClick(thread) },
        colors = CardDefaults.cardColors(
            containerColor = if (thread.unreadCount > 0) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(text = thread.contactName ?: thread.phone ?: "Unknown Number", style = MaterialTheme.typography.titleMedium)
                if (thread.unreadCount > 0) {
                    Badge { Text(thread.unreadCount.toString()) }
                }
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = thread.lastMessagePreview ?: "No messages yet",
                style = MaterialTheme.typography.bodyMedium,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
private fun MessageBubble(msg: WhatsAppMessage) {
    val isOutbound = msg.direction == "outbound"
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isOutbound) Arrangement.End else Arrangement.Start
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth(0.75f)
                .background(
                    color = if (isOutbound) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.secondaryContainer,
                    shape = RoundedCornerShape(12.dp)
                )
                .padding(12.dp)
        ) {
            Text(
                text = msg.text ?: "[${msg.kind}]",
                color = if (isOutbound) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSecondaryContainer
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MessageInput(onSend: (String) -> Unit) {
    var text by remember { mutableStateOf("") }
    BottomAppBar {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = text,
                onValueChange = { text = it },
                modifier = Modifier.weight(1f),
                placeholder = { Text("Type a message") },
                maxLines = 4
            )
            Spacer(modifier = Modifier.width(8.dp))
            IconButton(
                onClick = {
                    if (text.isNotBlank()) {
                        onSend(text)
                        text = ""
                    }
                },
                modifier = Modifier.background(MaterialTheme.colorScheme.primary, shape = RoundedCornerShape(50))
            ) {
                Icon(Icons.Default.Send, contentDescription = "Send", tint = MaterialTheme.colorScheme.onPrimary)
            }
        }
    }
}
