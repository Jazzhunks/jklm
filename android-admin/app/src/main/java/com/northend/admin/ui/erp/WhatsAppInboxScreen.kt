package com.northend.admin.ui.erp

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack

import androidx.compose.material3.adaptive.ExperimentalMaterial3AdaptiveApi
import androidx.compose.material3.adaptive.layout.ListDetailPaneScaffold
import androidx.compose.material3.adaptive.layout.ListDetailPaneScaffoldRole
import androidx.compose.material3.adaptive.navigation.rememberListDetailPaneScaffoldNavigator
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.AttachFile
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Description
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.northend.admin.data.remote.models.WhatsAppMessage
import com.northend.admin.data.remote.models.WhatsAppThread

@OptIn(ExperimentalMaterial3AdaptiveApi::class, ExperimentalMaterial3Api::class)
@Composable
fun WhatsAppInboxScreen(
    targetThreadId: String? = null,
    onLogout: () -> Unit = {},
    viewModel: WhatsAppViewModel = hiltViewModel(),
    onBack: () -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()
    
    val navigator = rememberListDetailPaneScaffoldNavigator<String>()

    // Sync selected thread with adaptive navigator
    LaunchedEffect(uiState.currentThread) {
        if (uiState.currentThread != null) {
            navigator.navigateTo(ListDetailPaneScaffoldRole.Detail, uiState.currentThread!!.id)
        } else {
            // Wait, returning to List doesn't clear the currentThread automatically unless we do it
            // We'll handle back presses in the navigator
        }
    }
    
    // Intercept back presses on Detail pane
    androidx.activity.compose.BackHandler(navigator.canNavigateBack()) {
        navigator.navigateBack()
        viewModel.deselectThread()
    }

    ListDetailPaneScaffold(
        directive = navigator.scaffoldDirective,
        value = navigator.scaffoldValue,
        listPane = {
            
                ThreadListPane(
                    threads = uiState.threads,
                    isLoading = uiState.isLoadingThreads,
                    selectedThreadId = uiState.currentThread?.id,
                    onThreadSelect = { thread -> 
                        viewModel.selectThread(thread)
                    },
                    onBack = onBack
                )
        },
        detailPane = {

            
                if (uiState.currentThread != null) {
                    ThreadDetailPane(
                        thread = uiState.currentThread!!,
                        messages = uiState.messages,
                        onBack = {
                            navigator.navigateBack()
                            viewModel.deselectThread()
                        },
                        onSendMessage = { text -> viewModel.sendMessage(text) }
                    )
                } else {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("Select a conversation", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
            }
        }
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ThreadListPane(
    threads: List<WhatsAppThread>,
    isLoading: Boolean,
    selectedThreadId: String?,
    onThreadSelect: (WhatsAppThread) -> Unit,
    onBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("WhatsApp Inbox") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { padding ->

        LazyColumn(
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
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ThreadDetailPane(
    thread: WhatsAppThread,
    messages: List<WhatsAppMessage>,
    onBack: () -> Unit,
    onSendMessage: (String) -> Unit
) {
    var showAttachmentSheet by remember { mutableStateOf(false) }
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        AsyncImage(
                            model = "https://ui-avatars.com/api/?name=${thread.contactName ?: thread.phone}&background=random",
                            contentDescription = "Avatar",
                            modifier = Modifier.size(36.dp).clip(CircleShape)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(thread.contactName ?: thread.phone ?: "Unknown", style = MaterialTheme.typography.titleMedium)
                            if (thread.studentName != null) {
                                Text(thread.studentName, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.7f))
                            }
                        }
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        },
        bottomBar = {
            Box(modifier = Modifier.imePadding().navigationBarsPadding()) {
                MessageInput(onSend = onSendMessage, onAttachClick = { showAttachmentSheet = true })
            }
        }
    ) { padding ->

        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding).background(MaterialTheme.colorScheme.background),
            reverseLayout = true
        ) {
            items(messages.reversed()) { msg ->
                MessageBubble(msg)
            }
        }
    }
}

@Composable
fun ThreadCard(thread: WhatsAppThread, isSelected: Boolean, onClick: () -> Unit) {
    val bgColor = if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surface
    val contentColor = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .background(bgColor)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        AsyncImage(
            model = "https://ui-avatars.com/api/?name=${thread.contactName ?: thread.phone}&background=random",
            contentDescription = "Avatar",
            modifier = Modifier.size(48.dp).clip(CircleShape)
        )
        Spacer(modifier = Modifier.width(16.dp))
        Column(modifier = Modifier.weight(1f)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(
                    text = thread.contactName ?: thread.phone ?: "Unknown",
                    style = MaterialTheme.typography.titleMedium,
                    color = contentColor,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = thread.lastMessageAt?.take(10) ?: "",
                    style = MaterialTheme.typography.bodySmall,
                    color = contentColor.copy(alpha = 0.6f)
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(
                    text = thread.lastMessagePreview ?: "",
                    style = MaterialTheme.typography.bodyMedium,
                    color = contentColor.copy(alpha = 0.8f),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f)
                )
                if (thread.unreadCount > 0) {
                    Box(
                        modifier = Modifier
                            .padding(start = 8.dp)
                            .background(MaterialTheme.colorScheme.primary, CircleShape)
                            .size(20.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = thread.unreadCount.toString(),
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onPrimary,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun MessageBubble(message: WhatsAppMessage) {
    val isFromMe = message.direction == "outbound"
    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
        horizontalArrangement = if (isFromMe) Arrangement.End else Arrangement.Start
    ) {
        Box(
            modifier = Modifier
                .widthIn(max = 280.dp)
                .background(
                    color = if (isFromMe) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
                    shape = MaterialTheme.shapes.medium
                )
                .padding(12.dp)
        ) {
            Column {
                Text(
                    text = message.text ?: "[Media]",
                    color = if (isFromMe) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = message.timestamp.take(16),
                    style = MaterialTheme.typography.labelSmall,
                    color = if (isFromMe) MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.6f) else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                    modifier = Modifier.align(Alignment.End).padding(top = 4.dp)
                )
            }
        }
    }
}

@Composable
fun MessageInput(onSend: (String) -> Unit, onAttachClick: () -> Unit = {}) {
    var text by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf("") }
    
    Surface(
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 2.dp
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onAttachClick) {
                Icon(Icons.Default.AttachFile, contentDescription = "Attach", tint = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            OutlinedTextField(
                value = text,
                onValueChange = { text = it },
                modifier = Modifier.weight(1f),
                placeholder = { Text("Type a message...") },
                shape = androidx.compose.foundation.shape.RoundedCornerShape(24.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            IconButton(
                onClick = {
                    if (text.isNotBlank()) {
                        onSend(text)
                        text = ""
                    }
                },
                modifier = Modifier.background(MaterialTheme.colorScheme.primary, shape = androidx.compose.foundation.shape.CircleShape)
            ) {
                Icon(Icons.Default.Send, contentDescription = "Send", tint = MaterialTheme.colorScheme.onPrimary)
            }
        }
    }
}

@Composable
fun AttachmentOption(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, onClick: () -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(8.dp)) {
        IconButton(
            onClick = onClick,
            modifier = Modifier.background(MaterialTheme.colorScheme.secondaryContainer, shape = androidx.compose.foundation.shape.CircleShape).padding(8.dp)
        ) {
            Icon(icon, contentDescription = label, tint = MaterialTheme.colorScheme.onSecondaryContainer)
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(label, style = MaterialTheme.typography.bodySmall)
    }
}
