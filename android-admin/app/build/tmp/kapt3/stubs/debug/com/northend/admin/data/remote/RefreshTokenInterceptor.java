package com.northend.admin.data.remote;

import com.northend.admin.data.local.TokenManager;
import com.northend.admin.data.remote.LoginRequest;
import com.northend.admin.data.remote.RefreshRequest;
import dagger.Lazy;
import java.io.IOException;
import javax.inject.Inject;
import javax.inject.Singleton;

@javax.inject.Singleton()
@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000<\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u000b\n\u0000\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\b\u0007\u0018\u00002\u00020\u0001B\u001d\b\u0007\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\f\u0010\u0004\u001a\b\u0012\u0004\u0012\u00020\u00060\u0005\u00a2\u0006\u0002\u0010\u0007J\u0010\u0010\f\u001a\u00020\r2\u0006\u0010\u000e\u001a\u00020\u000fH\u0016J\u0010\u0010\u0010\u001a\u00020\t2\u0006\u0010\u0011\u001a\u00020\u0012H\u0002R\u0014\u0010\u0004\u001a\b\u0012\u0004\u0012\u00020\u00060\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\b\u001a\u00020\tX\u0082\u000e\u00a2\u0006\u0002\n\u0000R\u000e\u0010\n\u001a\u00020\u000bX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0013"}, d2 = {"Lcom/northend/admin/data/remote/RefreshTokenInterceptor;", "Lokhttp3/Interceptor;", "tokenManager", "Lcom/northend/admin/data/local/TokenManager;", "apiService", "Ldagger/Lazy;", "Lcom/northend/admin/data/remote/AdminApiService;", "(Lcom/northend/admin/data/local/TokenManager;Ldagger/Lazy;)V", "isRefreshing", "", "lock", "", "intercept", "Lokhttp3/Response;", "chain", "Lokhttp3/Interceptor$Chain;", "isAuthEndpoint", "request", "Lokhttp3/Request;", "app_debug"})
public final class RefreshTokenInterceptor implements okhttp3.Interceptor {
    @org.jetbrains.annotations.NotNull()
    private final com.northend.admin.data.local.TokenManager tokenManager = null;
    @org.jetbrains.annotations.NotNull()
    private final dagger.Lazy<com.northend.admin.data.remote.AdminApiService> apiService = null;
    @kotlin.jvm.Volatile()
    private volatile boolean isRefreshing = false;
    @org.jetbrains.annotations.NotNull()
    private final java.lang.Object lock = null;
    
    @javax.inject.Inject()
    public RefreshTokenInterceptor(@org.jetbrains.annotations.NotNull()
    com.northend.admin.data.local.TokenManager tokenManager, @org.jetbrains.annotations.NotNull()
    dagger.Lazy<com.northend.admin.data.remote.AdminApiService> apiService) {
        super();
    }
    
    @java.lang.Override()
    @kotlin.jvm.Throws(exceptionClasses = {java.io.IOException.class})
    @org.jetbrains.annotations.NotNull()
    public okhttp3.Response intercept(@org.jetbrains.annotations.NotNull()
    okhttp3.Interceptor.Chain chain) throws java.io.IOException {
        return null;
    }
    
    private final boolean isAuthEndpoint(okhttp3.Request request) {
        return false;
    }
}