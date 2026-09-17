package com.northend.admin.ui.erp;

@kotlin.Metadata(mv = {1, 9, 0}, k = 2, xi = 48, d1 = {"\u0000:\n\u0000\n\u0002\u0018\u0002\n\u0002\b\f\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0010\u000e\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\u001a\u0010\u0010\r\u001a\u00020\u000e2\u0006\u0010\u000f\u001a\u00020\u0010H\u0003\u001a\u001c\u0010\u0011\u001a\u00020\u000e2\u0012\u0010\u0012\u001a\u000e\u0012\u0004\u0012\u00020\u0014\u0012\u0004\u0012\u00020\u000e0\u0013H\u0003\u001a$\u0010\u0015\u001a\u00020\u000e2\u0006\u0010\u0016\u001a\u00020\u00172\u0012\u0010\u0018\u001a\u000e\u0012\u0004\u0012\u00020\u0017\u0012\u0004\u0012\u00020\u000e0\u0013H\u0003\u001a.\u0010\u0019\u001a\u00020\u000e2\b\b\u0002\u0010\u001a\u001a\u00020\u001b2\n\b\u0002\u0010\u001c\u001a\u0004\u0018\u00010\u00142\u000e\b\u0002\u0010\u001d\u001a\b\u0012\u0004\u0012\u00020\u000e0\u001eH\u0007\"\u0013\u0010\u0000\u001a\u00020\u0001\u00a2\u0006\n\n\u0002\u0010\u0004\u001a\u0004\b\u0002\u0010\u0003\"\u0013\u0010\u0005\u001a\u00020\u0001\u00a2\u0006\n\n\u0002\u0010\u0004\u001a\u0004\b\u0006\u0010\u0003\"\u0013\u0010\u0007\u001a\u00020\u0001\u00a2\u0006\n\n\u0002\u0010\u0004\u001a\u0004\b\b\u0010\u0003\"\u0013\u0010\t\u001a\u00020\u0001\u00a2\u0006\n\n\u0002\u0010\u0004\u001a\u0004\b\n\u0010\u0003\"\u0013\u0010\u000b\u001a\u00020\u0001\u00a2\u0006\n\n\u0002\u0010\u0004\u001a\u0004\b\f\u0010\u0003\u00a8\u0006\u001f"}, d2 = {"WhatsAppChatBg", "Landroidx/compose/ui/graphics/Color;", "getWhatsAppChatBg", "()J", "J", "WhatsAppGrayText", "getWhatsAppGrayText", "WhatsAppLightGreen", "getWhatsAppLightGreen", "WhatsAppOutgoing", "getWhatsAppOutgoing", "WhatsAppTeal", "getWhatsAppTeal", "MessageBubble", "", "msg", "Lcom/northend/admin/data/remote/models/WhatsAppMessage;", "MessageInput", "onSend", "Lkotlin/Function1;", "", "ThreadCard", "thread", "Lcom/northend/admin/data/remote/models/WhatsAppThread;", "onClick", "WhatsAppInboxScreen", "viewModel", "Lcom/northend/admin/ui/erp/WhatsAppViewModel;", "targetThreadId", "onLogout", "Lkotlin/Function0;", "app_debug"})
public final class WhatsAppInboxScreenKt {
    private static final long WhatsAppTeal = 0L;
    private static final long WhatsAppLightGreen = 0L;
    private static final long WhatsAppOutgoing = 0L;
    private static final long WhatsAppChatBg = 0L;
    private static final long WhatsAppGrayText = 0L;
    
    public static final long getWhatsAppTeal() {
        return 0L;
    }
    
    public static final long getWhatsAppLightGreen() {
        return 0L;
    }
    
    public static final long getWhatsAppOutgoing() {
        return 0L;
    }
    
    public static final long getWhatsAppChatBg() {
        return 0L;
    }
    
    public static final long getWhatsAppGrayText() {
        return 0L;
    }
    
    @kotlin.OptIn(markerClass = {androidx.compose.material3.ExperimentalMaterial3Api.class})
    @androidx.compose.runtime.Composable()
    public static final void WhatsAppInboxScreen(@org.jetbrains.annotations.NotNull()
    com.northend.admin.ui.erp.WhatsAppViewModel viewModel, @org.jetbrains.annotations.Nullable()
    java.lang.String targetThreadId, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onLogout) {
    }
    
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