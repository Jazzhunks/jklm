package com.northend.admin.ui.auth;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000$\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u000b\n\u0000\n\u0002\u0010\u0002\n\u0000\u0018\u00002\u00020\u0001B\u0015\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u00a2\u0006\u0002\u0010\u0006J\u0006\u0010\u0007\u001a\u00020\bJ\u0006\u0010\t\u001a\u00020\nR\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u000b"}, d2 = {"Lcom/northend/admin/ui/auth/AuthViewModel;", "Landroidx/lifecycle/ViewModel;", "tokenManager", "Lcom/northend/admin/data/local/TokenManager;", "repository", "Lcom/northend/admin/data/repository/AdminRepository;", "(Lcom/northend/admin/data/local/TokenManager;Lcom/northend/admin/data/repository/AdminRepository;)V", "isLoggedIn", "", "logout", "", "app_debug"})
public final class AuthViewModel extends androidx.lifecycle.ViewModel {
    @org.jetbrains.annotations.NotNull()
    private final com.northend.admin.data.local.TokenManager tokenManager = null;
    @org.jetbrains.annotations.NotNull()
    private final com.northend.admin.data.repository.AdminRepository repository = null;
    
    public AuthViewModel(@org.jetbrains.annotations.NotNull()
    com.northend.admin.data.local.TokenManager tokenManager, @org.jetbrains.annotations.NotNull()
    com.northend.admin.data.repository.AdminRepository repository) {
        super();
    }
    
    public final boolean isLoggedIn() {
        return false;
    }
    
    public final void logout() {
    }
}