package com.northend.admin.ui.erp;

@kotlin.Metadata(mv = {1, 9, 0}, k = 2, xi = 48, d1 = {"\u00002\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0010\u000e\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\u001a\u0010\u0010\u0000\u001a\u00020\u00012\u0006\u0010\u0002\u001a\u00020\u0003H\u0003\u001a\u001c\u0010\u0004\u001a\u00020\u00012\u0012\u0010\u0005\u001a\u000e\u0012\u0004\u0012\u00020\u0007\u0012\u0004\u0012\u00020\u00010\u0006H\u0003\u001a$\u0010\b\u001a\u00020\u00012\u0006\u0010\t\u001a\u00020\n2\u0012\u0010\u000b\u001a\u000e\u0012\u0004\u0012\u00020\n\u0012\u0004\u0012\u00020\u00010\u0006H\u0003\u001a.\u0010\f\u001a\u00020\u00012\b\b\u0002\u0010\r\u001a\u00020\u000e2\n\b\u0002\u0010\u000f\u001a\u0004\u0018\u00010\u00072\u000e\b\u0002\u0010\u0010\u001a\b\u0012\u0004\u0012\u00020\u00010\u0011H\u0007\u00a8\u0006\u0012"}, d2 = {"MessageBubble", "", "msg", "Lcom/northend/admin/data/remote/models/WhatsAppMessage;", "MessageInput", "onSend", "Lkotlin/Function1;", "", "ThreadCard", "thread", "Lcom/northend/admin/data/remote/models/WhatsAppThread;", "onClick", "WhatsAppInboxScreen", "viewModel", "Lcom/northend/admin/ui/erp/WhatsAppViewModel;", "targetThreadId", "onLogout", "Lkotlin/Function0;", "app_debug"})
public final class WhatsAppInboxScreenKt {
    
    @kotlin.OptIn(markerClass = {androidx.compose.material3.ExperimentalMaterial3Api.class})
    @androidx.compose.runtime.Composable()
    public static final void WhatsAppInboxScreen(@org.jetbrains.annotations.NotNull()
    com.northend.admin.ui.erp.WhatsAppViewModel viewModel, @org.jetbrains.annotations.Nullable()
    java.lang.String targetThreadId, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onLogout) {
    }
    
    @kotlin.OptIn(markerClass = {androidx.compose.material3.ExperimentalMaterial3Api.class})
    @androidx.compose.runtime.Composable()
    private static final void ThreadCard(com.northend.admin.data.remote.models.WhatsAppThread thread, kotlin.jvm.functions.Function1<? super com.northend.admin.data.remote.models.WhatsAppThread, kotlin.Unit> onClick) {
    }
    
    @androidx.compose.runtime.Composable()
    private static final void MessageBubble(com.northend.admin.data.remote.models.WhatsAppMessage msg) {
    }
    
    @kotlin.OptIn(markerClass = {androidx.compose.material3.ExperimentalMaterial3Api.class})
    @androidx.compose.runtime.Composable()
    private static final void MessageInput(kotlin.jvm.functions.Function1<? super java.lang.String, kotlin.Unit> onSend) {
    }
}