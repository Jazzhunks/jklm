package com.northend.admin.ui.erp;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00004\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010\u000b\n\u0002\b\u0002\n\u0002\u0010\u000e\n\u0000\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0013\n\u0002\u0010\b\n\u0002\b\u0002\b\u0086\b\u0018\u00002\u00020\u0001BQ\u0012\b\b\u0002\u0010\u0002\u001a\u00020\u0003\u0012\b\b\u0002\u0010\u0004\u001a\u00020\u0003\u0012\n\b\u0002\u0010\u0005\u001a\u0004\u0018\u00010\u0006\u0012\u000e\b\u0002\u0010\u0007\u001a\b\u0012\u0004\u0012\u00020\t0\b\u0012\n\b\u0002\u0010\n\u001a\u0004\u0018\u00010\t\u0012\u000e\b\u0002\u0010\u000b\u001a\b\u0012\u0004\u0012\u00020\f0\b\u00a2\u0006\u0002\u0010\rJ\t\u0010\u0016\u001a\u00020\u0003H\u00c6\u0003J\t\u0010\u0017\u001a\u00020\u0003H\u00c6\u0003J\u000b\u0010\u0018\u001a\u0004\u0018\u00010\u0006H\u00c6\u0003J\u000f\u0010\u0019\u001a\b\u0012\u0004\u0012\u00020\t0\bH\u00c6\u0003J\u000b\u0010\u001a\u001a\u0004\u0018\u00010\tH\u00c6\u0003J\u000f\u0010\u001b\u001a\b\u0012\u0004\u0012\u00020\f0\bH\u00c6\u0003JU\u0010\u001c\u001a\u00020\u00002\b\b\u0002\u0010\u0002\u001a\u00020\u00032\b\b\u0002\u0010\u0004\u001a\u00020\u00032\n\b\u0002\u0010\u0005\u001a\u0004\u0018\u00010\u00062\u000e\b\u0002\u0010\u0007\u001a\b\u0012\u0004\u0012\u00020\t0\b2\n\b\u0002\u0010\n\u001a\u0004\u0018\u00010\t2\u000e\b\u0002\u0010\u000b\u001a\b\u0012\u0004\u0012\u00020\f0\bH\u00c6\u0001J\u0013\u0010\u001d\u001a\u00020\u00032\b\u0010\u001e\u001a\u0004\u0018\u00010\u0001H\u00d6\u0003J\t\u0010\u001f\u001a\u00020 H\u00d6\u0001J\t\u0010!\u001a\u00020\u0006H\u00d6\u0001R\u0013\u0010\n\u001a\u0004\u0018\u00010\t\u00a2\u0006\b\n\u0000\u001a\u0004\b\u000e\u0010\u000fR\u0013\u0010\u0005\u001a\u0004\u0018\u00010\u0006\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0010\u0010\u0011R\u0011\u0010\u0004\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0004\u0010\u0012R\u0011\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0002\u0010\u0012R\u0017\u0010\u000b\u001a\b\u0012\u0004\u0012\u00020\f0\b\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0013\u0010\u0014R\u0017\u0010\u0007\u001a\b\u0012\u0004\u0012\u00020\t0\b\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0015\u0010\u0014\u00a8\u0006\""}, d2 = {"Lcom/northend/admin/ui/erp/WhatsAppUiState;", "", "isLoadingThreads", "", "isLoadingMessages", "error", "", "threads", "", "Lcom/northend/admin/data/remote/models/WhatsAppThread;", "currentThread", "messages", "Lcom/northend/admin/data/remote/models/WhatsAppMessage;", "(ZZLjava/lang/String;Ljava/util/List;Lcom/northend/admin/data/remote/models/WhatsAppThread;Ljava/util/List;)V", "getCurrentThread", "()Lcom/northend/admin/data/remote/models/WhatsAppThread;", "getError", "()Ljava/lang/String;", "()Z", "getMessages", "()Ljava/util/List;", "getThreads", "component1", "component2", "component3", "component4", "component5", "component6", "copy", "equals", "other", "hashCode", "", "toString", "app_debug"})
public final class WhatsAppUiState {
    private final boolean isLoadingThreads = false;
    private final boolean isLoadingMessages = false;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String error = null;
    @org.jetbrains.annotations.NotNull()
    private final java.util.List<com.northend.admin.data.remote.models.WhatsAppThread> threads = null;
    @org.jetbrains.annotations.Nullable()
    private final com.northend.admin.data.remote.models.WhatsAppThread currentThread = null;
    @org.jetbrains.annotations.NotNull()
    private final java.util.List<com.northend.admin.data.remote.models.WhatsAppMessage> messages = null;
    
    public WhatsAppUiState(boolean isLoadingThreads, boolean isLoadingMessages, @org.jetbrains.annotations.Nullable()
    java.lang.String error, @org.jetbrains.annotations.NotNull()
    java.util.List<com.northend.admin.data.remote.models.WhatsAppThread> threads, @org.jetbrains.annotations.Nullable()
    com.northend.admin.data.remote.models.WhatsAppThread currentThread, @org.jetbrains.annotations.NotNull()
    java.util.List<com.northend.admin.data.remote.models.WhatsAppMessage> messages) {
        super();
    }
    
    public final boolean isLoadingThreads() {
        return false;
    }
    
    public final boolean isLoadingMessages() {
        return false;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getError() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<com.northend.admin.data.remote.models.WhatsAppThread> getThreads() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final com.northend.admin.data.remote.models.WhatsAppThread getCurrentThread() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<com.northend.admin.data.remote.models.WhatsAppMessage> getMessages() {
        return null;
    }
    
    public WhatsAppUiState() {
        super();
    }
    
    public final boolean component1() {
        return false;
    }
    
    public final boolean component2() {
        return false;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component3() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<com.northend.admin.data.remote.models.WhatsAppThread> component4() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final com.northend.admin.data.remote.models.WhatsAppThread component5() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<com.northend.admin.data.remote.models.WhatsAppMessage> component6() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.northend.admin.ui.erp.WhatsAppUiState copy(boolean isLoadingThreads, boolean isLoadingMessages, @org.jetbrains.annotations.Nullable()
    java.lang.String error, @org.jetbrains.annotations.NotNull()
    java.util.List<com.northend.admin.data.remote.models.WhatsAppThread> threads, @org.jetbrains.annotations.Nullable()
    com.northend.admin.data.remote.models.WhatsAppThread currentThread, @org.jetbrains.annotations.NotNull()
    java.util.List<com.northend.admin.data.remote.models.WhatsAppMessage> messages) {
        return null;
    }
    
    @java.lang.Override()
    public boolean equals(@org.jetbrains.annotations.Nullable()
    java.lang.Object other) {
        return false;
    }
    
    @java.lang.Override()
    public int hashCode() {
        return 0;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.NotNull()
    public java.lang.String toString() {
        return null;
    }
}