package com.northend.admin.di;

import android.content.Context;
import com.northend.admin.data.local.TokenManager;
import com.northend.admin.data.local.room.WhatsAppDao;
import com.northend.admin.data.remote.AdminApiService;
import com.northend.admin.data.repository.AdminRepository;
import com.northend.admin.utils.Constants;
import dagger.Module;
import dagger.Provides;
import dagger.hilt.InstallIn;
import dagger.hilt.android.qualifiers.ApplicationContext;
import dagger.hilt.components.SingletonComponent;
import com.northend.admin.data.remote.AuthInterceptor;
import com.northend.admin.data.remote.RefreshTokenInterceptor;
import com.northend.admin.BuildConfig;
import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.moshi.MoshiConverterFactory;
import com.squareup.moshi.Moshi;
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory;
import dagger.Lazy;
import java.util.concurrent.TimeUnit;
import javax.inject.Singleton;

@dagger.Module()
@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000D\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0005\n\u0002\u0018\u0002\n\u0000\b\u00c7\u0002\u0018\u00002\u00020\u0001B\u0007\b\u0002\u00a2\u0006\u0002\u0010\u0002J\u0010\u0010\u0003\u001a\u00020\u00042\u0006\u0010\u0005\u001a\u00020\u0006H\u0007J \u0010\u0007\u001a\u00020\b2\u0006\u0010\t\u001a\u00020\u00042\u0006\u0010\n\u001a\u00020\u000b2\u0006\u0010\f\u001a\u00020\rH\u0007J\b\u0010\u000e\u001a\u00020\u000fH\u0007J\u001e\u0010\u0010\u001a\u00020\u00112\u0006\u0010\n\u001a\u00020\u000b2\f\u0010\t\u001a\b\u0012\u0004\u0012\u00020\u00040\u0012H\u0007J\u0018\u0010\u0013\u001a\u00020\u00062\u0006\u0010\u0014\u001a\u00020\u00112\u0006\u0010\u0015\u001a\u00020\u000fH\u0007J\u0012\u0010\u0016\u001a\u00020\u000b2\b\b\u0001\u0010\u0017\u001a\u00020\u0018H\u0007\u00a8\u0006\u0019"}, d2 = {"Lcom/northend/admin/di/NetworkModule;", "", "()V", "provideAdminApiService", "Lcom/northend/admin/data/remote/AdminApiService;", "retrofit", "Lretrofit2/Retrofit;", "provideAdminRepository", "Lcom/northend/admin/data/repository/AdminRepository;", "apiService", "tokenManager", "Lcom/northend/admin/data/local/TokenManager;", "whatsAppDao", "Lcom/northend/admin/data/local/room/WhatsAppDao;", "provideMoshi", "Lcom/squareup/moshi/Moshi;", "provideOkHttpClient", "Lokhttp3/OkHttpClient;", "Ldagger/Lazy;", "provideRetrofit", "okHttpClient", "moshi", "provideTokenManager", "context", "Landroid/content/Context;", "app_debug"})
@dagger.hilt.InstallIn(value = {dagger.hilt.components.SingletonComponent.class})
public final class NetworkModule {
    @org.jetbrains.annotations.NotNull()
    public static final com.northend.admin.di.NetworkModule INSTANCE = null;
    
    private NetworkModule() {
        super();
    }
    
    @dagger.Provides()
    @javax.inject.Singleton()
    @org.jetbrains.annotations.NotNull()
    public final com.squareup.moshi.Moshi provideMoshi() {
        return null;
    }
    
    @dagger.Provides()
    @javax.inject.Singleton()
    @org.jetbrains.annotations.NotNull()
    public final okhttp3.OkHttpClient provideOkHttpClient(@org.jetbrains.annotations.NotNull()
    com.northend.admin.data.local.TokenManager tokenManager, @org.jetbrains.annotations.NotNull()
    dagger.Lazy<com.northend.admin.data.remote.AdminApiService> apiService) {
        return null;
    }
    
    @dagger.Provides()
    @javax.inject.Singleton()
    @org.jetbrains.annotations.NotNull()
    public final retrofit2.Retrofit provideRetrofit(@org.jetbrains.annotations.NotNull()
    okhttp3.OkHttpClient okHttpClient, @org.jetbrains.annotations.NotNull()
    com.squareup.moshi.Moshi moshi) {
        return null;
    }
    
    @dagger.Provides()
    @javax.inject.Singleton()
    @org.jetbrains.annotations.NotNull()
    public final com.northend.admin.data.remote.AdminApiService provideAdminApiService(@org.jetbrains.annotations.NotNull()
    retrofit2.Retrofit retrofit) {
        return null;
    }
    
    @dagger.Provides()
    @javax.inject.Singleton()
    @org.jetbrains.annotations.NotNull()
    public final com.northend.admin.data.repository.AdminRepository provideAdminRepository(@org.jetbrains.annotations.NotNull()
    com.northend.admin.data.remote.AdminApiService apiService, @org.jetbrains.annotations.NotNull()
    com.northend.admin.data.local.TokenManager tokenManager, @org.jetbrains.annotations.NotNull()
    com.northend.admin.data.local.room.WhatsAppDao whatsAppDao) {
        return null;
    }
    
    @dagger.Provides()
    @javax.inject.Singleton()
    @org.jetbrains.annotations.NotNull()
    public final com.northend.admin.data.local.TokenManager provideTokenManager(@dagger.hilt.android.qualifiers.ApplicationContext()
    @org.jetbrains.annotations.NotNull()
    android.content.Context context) {
        return null;
    }
}