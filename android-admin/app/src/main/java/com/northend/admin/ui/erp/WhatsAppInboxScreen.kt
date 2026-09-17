package com.northend.admin.ui.erp

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.activity.compose.BackHandler
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.northend.admin.data.remote.models.WhatsAppMessage
import com.northend.admin.data.remote.models.WhatsAppThread
import com.northend.admin.ui.components.ErrorView
import com.northend.admin.ui.components.LoadingIndicator

val WhatsAppTeal = Color(0xFF075E54)
val WhatsAppLightGreen = Color(0xFF25D366)
val WhatsAppOutgoing = Color(0xFFDCF8C6)
val WhatsAppChatBg = Color(0xFFECE5DD)
val WhatsAppGrayText = Color(0xFF667781)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WhatsAppInboxScreen(viewModel: WhatsAppViewModel = hiltViewModel(), targetThreadId: String? = null, onLogout: () -> Unit = {}) {
    val state by viewModel.uiState.collectAsState()

    BackHandler(enabled = state.currentThread != null) {
        viewModel.deselectThread()
    }

    LaunchedEffect(targetThreadId, state.threads) {
        if (targetThreadId != null && state.threads.isNotEmpty()) {
            val target = state.threads.find { it.id == targetThreadId }
            if (target != null && state.currentThread?.id != targetThreadId) {
                viewModel.selectThread(target)
            }
        }
    }
    
    LaunchedEffect(Unit) {
        try {
            com.google.firebase.messaging.FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    val token = task.result
                    android.util.Log.d("FCM", "Fetched token: $token")
                    viewModel.updateFcmToken(token)
                }
            }
        } catch(e: Exception) {}
    }


    if (state.currentThread == null) {
        Scaffold(
            topBar = { 
                TopAppBar(
                    title = { Text("WhatsApp", color = Color.White, fontWeight = FontWeight.SemiBold) },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = WhatsAppTeal),
                    actions = {
                        IconButton(onClick = onLogout) {
                            Icon(Icons.Default.ExitToApp, "Logout", tint = Color.White)
                        }
                    }
                ) 
            }
        ) { padding ->
            Column(modifier = Modifier.fillMaxSize().padding(padding).background(Color.White)) {
                if (state.isLoadingThreads) {
                    LoadingIndicator()
                } else if (state.error != null) {
                    ErrorView(state.error!!, onRetry = { viewModel.loadThreads() })
                } else {
                    LazyColumn(modifier = Modifier.fillMaxSize()) {
                        items(state.threads) { thread ->
                            ThreadCard(thread) { viewModel.selectThread(it) }
                            Divider(color = Color(0xFFF2F2F2), modifier = Modifier.padding(start = 76.dp))
                        }
                    }
                }
            }
        }
    } else {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { 
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier.size(36.dp).clip(CircleShape).background(Color.LightGray),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Filled.Person, contentDescription = null, tint = Color.White)
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                text = state.currentThread!!.contactName ?: state.currentThread!!.studentName ?: state.currentThread!!.phone ?: "Unknown Number",
                                color = Color.White,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Medium,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    },
                    navigationIcon = {
                        IconButton(onClick = { viewModel.deselectThread() }) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = WhatsAppTeal)
                )
            },
            bottomBar = {
                Box(modifier = Modifier.imePadding().navigationBarsPadding()) {
                    MessageInput { text -> viewModel.sendMessage(text) }
                }
            }
        ) { padding ->
            Column(modifier = Modifier.fillMaxSize().padding(padding).background(WhatsAppChatBg)) {
                if (state.isLoadingMessages) {
                    LoadingIndicator()
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp),
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

@Composable
private fun ThreadCard(thread: WhatsAppThread, onClick: (WhatsAppThread) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick(thread) }
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier.size(48.dp).clip(CircleShape).background(Color(0xFFDFE5E7)),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Filled.Person, contentDescription = null, tint = Color.White, modifier = Modifier.size(32.dp))
        }
        Spacer(modifier = Modifier.width(16.dp))
        Column(modifier = Modifier.weight(1f)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = thread.contactName ?: thread.studentName ?: thread.phone ?: "Unknown Number", 
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.Black,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f)
                )
                if (thread.lastMessageAt != null) {
                    Text(
                        text = thread.lastMessageAt.split("T").lastOrNull()?.take(5) ?: "",
                        fontSize = 12.sp,
                        color = if (thread.unreadCount > 0) WhatsAppLightGreen else WhatsAppGrayText
                    )
                }
            }
            Spacer(modifier = Modifier.height(2.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = thread.lastMessagePreview ?: "No messages yet",
                    fontSize = 14.sp,
                    color = WhatsAppGrayText,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f)
                )
                if (thread.unreadCount > 0) {
                    Spacer(modifier = Modifier.width(8.dp))
                    Box(
                        modifier = Modifier.size(20.dp).clip(CircleShape).background(WhatsAppLightGreen),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = thread.unreadCount.toString(), color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
private fun MessageBubble(msg: WhatsAppMessage) {
    val isOutbound = msg.direction == "outbound"
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp),
        horizontalArrangement = if (isOutbound) Arrangement.End else Arrangement.Start
    ) {
        Box(
            modifier = Modifier
                .widthIn(max = 280.dp)
                .background(
                    color = if (isOutbound) WhatsAppOutgoing else Color.White,
                    shape = RoundedCornerShape(
                        topStart = 12.dp,
                        topEnd = 12.dp,
                        bottomStart = if (isOutbound) 12.dp else 0.dp,
                        bottomEnd = if (isOutbound) 0.dp else 12.dp
                    )
                )
                .padding(horizontal = 12.dp, vertical = 8.dp)
        ) {
            Column {
                Text(
                    text = msg.text ?: "[${msg.kind}]",
                    color = Color.Black,
                    fontSize = 15.sp
                )
                Text(
                    text = msg.timestamp.split("T").lastOrNull()?.take(5) ?: "",
                    fontSize = 10.sp,
                    color = WhatsAppGrayText,
                    modifier = Modifier.align(Alignment.End).padding(top = 2.dp)
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MessageInput(onSend: (String) -> Unit) {
    var text by remember { mutableStateOf("") }
    Surface(color = Color.Transparent) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 8.dp)
                .background(Color.Transparent),
            verticalAlignment = Alignment.Bottom
        ) {
            OutlinedTextField(
                value = text,
                onValueChange = { text = it },
                modifier = Modifier
                    .weight(1f)
                    .background(Color.White, shape = RoundedCornerShape(24.dp)),
                placeholder = { Text("Message", color = WhatsAppGrayText) },
                maxLines = 6,
                colors = TextFieldDefaults.outlinedTextFieldColors(
                    focusedBorderColor = Color.Transparent,
                    unfocusedBorderColor = Color.Transparent,
                    containerColor = Color.Transparent
                ),
                shape = RoundedCornerShape(24.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(WhatsAppTeal)
                    .clickable {
                        if (text.isNotBlank()) {
                            onSend(text)
                            text = ""
                        }
                    },
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.Send, contentDescription = "Send", tint = Color.White, modifier = Modifier.size(20.dp).padding(start=4.dp))
            }
        }
    }
}
