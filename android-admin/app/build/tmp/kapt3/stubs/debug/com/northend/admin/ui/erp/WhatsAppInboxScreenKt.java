package com.northend.admin.ui.erp;

import androidx.compose.foundation.layout.*;
import androidx.compose.material.icons.Icons;
import androidx.compose.material3.adaptive.ExperimentalMaterial3AdaptiveApi;
import androidx.compose.material3.adaptive.layout.ListDetailPaneScaffoldRole;
import androidx.compose.material3.*;
import androidx.compose.runtime.*;
import androidx.compose.ui.Alignment;
import androidx.compose.ui.Modifier;
import androidx.compose.ui.text.font.FontWeight;
import androidx.compose.ui.text.style.TextOverflow;
import com.northend.admin.data.remote.models.WhatsAppMessage;
import com.northend.admin.data.remote.models.WhatsAppThread;

@kotlin.Metadata(mv = {1, 9, 0}, k = 2, xi = 48, d1 = {"\u0000H\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000b\n\u0002\b\u0002\n\u0002\u0010 \n\u0002\b\u000b\n\u0002\u0018\u0002\n\u0000\u001a&\u0010\u0000\u001a\u00020\u00012\u0006\u0010\u0002\u001a\u00020\u00032\u0006\u0010\u0004\u001a\u00020\u00052\f\u0010\u0006\u001a\b\u0012\u0004\u0012\u00020\u00010\u0007H\u0007\u001a\u0010\u0010\b\u001a\u00020\u00012\u0006\u0010\t\u001a\u00020\nH\u0007\u001a,\u0010\u000b\u001a\u00020\u00012\u0012\u0010\f\u001a\u000e\u0012\u0004\u0012\u00020\u0005\u0012\u0004\u0012\u00020\u00010\r2\u000e\b\u0002\u0010\u000e\u001a\b\u0012\u0004\u0012\u00020\u00010\u0007H\u0007\u001a&\u0010\u000f\u001a\u00020\u00012\u0006\u0010\u0010\u001a\u00020\u00112\u0006\u0010\u0012\u001a\u00020\u00132\f\u0010\u0006\u001a\b\u0012\u0004\u0012\u00020\u00010\u0007H\u0007\u001a@\u0010\u0014\u001a\u00020\u00012\u0006\u0010\u0010\u001a\u00020\u00112\f\u0010\u0015\u001a\b\u0012\u0004\u0012\u00020\n0\u00162\f\u0010\u0017\u001a\b\u0012\u0004\u0012\u00020\u00010\u00072\u0012\u0010\u0018\u001a\u000e\u0012\u0004\u0012\u00020\u0005\u0012\u0004\u0012\u00020\u00010\rH\u0007\u001aJ\u0010\u0019\u001a\u00020\u00012\f\u0010\u001a\u001a\b\u0012\u0004\u0012\u00020\u00110\u00162\u0006\u0010\u001b\u001a\u00020\u00132\b\u0010\u001c\u001a\u0004\u0018\u00010\u00052\u0012\u0010\u001d\u001a\u000e\u0012\u0004\u0012\u00020\u0011\u0012\u0004\u0012\u00020\u00010\r2\f\u0010\u0017\u001a\b\u0012\u0004\u0012\u00020\u00010\u0007H\u0007\u001a>\u0010\u001e\u001a\u00020\u00012\n\b\u0002\u0010\u001f\u001a\u0004\u0018\u00010\u00052\u000e\b\u0002\u0010 \u001a\b\u0012\u0004\u0012\u00020\u00010\u00072\b\b\u0002\u0010!\u001a\u00020\"2\u000e\b\u0002\u0010\u0017\u001a\b\u0012\u0004\u0012\u00020\u00010\u0007H\u0007\u00a8\u0006#"}, d2 = {"AttachmentOption", "", "icon", "Landroidx/compose/ui/graphics/vector/ImageVector;", "label", "", "onClick", "Lkotlin/Function0;", "MessageBubble", "message", "Lcom/northend/admin/data/remote/models/WhatsAppMessage;", "MessageInput", "onSend", "Lkotlin/Function1;", "onAttachClick", "ThreadCard", "thread", "Lcom/northend/admin/data/remote/models/WhatsAppThread;", "isSelected", "", "ThreadDetailPane", "messages", "", "onBack", "onSendMessage", "ThreadListPane", "threads", "isLoading", "selectedThreadId", "onThreadSelect", "WhatsAppInboxScreen", "targetThreadId", "onLogout", "viewModel", "Lcom/northend/admin/ui/erp/WhatsAppViewModel;", "app_debug"})
public final class WhatsAppInboxScreenKt {
    
    @kotlin.OptIn(markerClass = {androidx.compose.material3.adaptive.ExperimentalMaterial3AdaptiveApi.class, androidx.compose.material3.ExperimentalMaterial3Api.class})
    @androidx.compose.runtime.Composable()
    public static final void WhatsAppInboxScreen(@org.jetbrains.annotations.Nullable()
    java.lang.String targetThreadId, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onLogout, @org.jetbrains.annotations.NotNull()
    com.northend.admin.ui.erp.WhatsAppViewModel viewModel, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onBack) {
    }
    
    @kotlin.OptIn(markerClass = {androidx.compose.material3.ExperimentalMaterial3Api.class})
    @androidx.compose.runtime.Composable()
    public static final void ThreadListPane(@org.jetbrains.annotations.NotNull()
    java.util.List<com.northend.admin.data.remote.models.WhatsAppThread> threads, boolean isLoading, @org.jetbrains.annotations.Nullable()
    java.lang.String selectedThreadId, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function1<? super com.northend.admin.data.remote.models.WhatsAppThread, kotlin.Unit> onThreadSelect, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onBack) {
    }
    
    @kotlin.OptIn(markerClass = {androidx.compose.material3.ExperimentalMaterial3Api.class})
    @androidx.compose.runtime.Composable()
    public static final void ThreadDetailPane(@org.jetbrains.annotations.NotNull()
    com.northend.admin.data.remote.models.WhatsAppThread thread, @org.jetbrains.annotations.NotNull()
    java.util.List<com.northend.admin.data.remote.models.WhatsAppMessage> messages, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onBack, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function1<? super java.lang.String, kotlin.Unit> onSendMessage) {
    }
    
    @androidx.compose.runtime.Composable()
    public static final void ThreadCard(@org.jetbrains.annotations.NotNull()
    com.northend.admin.data.remote.models.WhatsAppThread thread, boolean isSelected, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onClick) {
    }
    
    @androidx.compose.runtime.Composable()
    public static final void MessageBubble(@org.jetbrains.annotations.NotNull()
    com.northend.admin.data.remote.models.WhatsAppMessage message) {
    }
    
    @androidx.compose.runtime.Composable()
    public static final void MessageInput(@org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function1<? super java.lang.String, kotlin.Unit> onSend, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onAttachClick) {
    }
    
    @androidx.compose.runtime.Composable()
    public static final void AttachmentOption(@org.jetbrains.annotations.NotNull()
    androidx.compose.ui.graphics.vector.ImageVector icon, @org.jetbrains.annotations.NotNull()
    java.lang.String label, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onClick) {
    }
}