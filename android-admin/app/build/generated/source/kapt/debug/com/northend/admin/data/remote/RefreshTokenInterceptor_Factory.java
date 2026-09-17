package com.northend.admin.data.remote;

import com.northend.admin.data.local.TokenManager;
import dagger.Lazy;
import dagger.internal.DaggerGenerated;
import dagger.internal.DoubleCheck;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata("javax.inject.Singleton")
@QualifierMetadata
@DaggerGenerated
@Generated(
    value = "dagger.internal.codegen.ComponentProcessor",
    comments = "https://dagger.dev"
)
@SuppressWarnings({
    "unchecked",
    "rawtypes",
    "KotlinInternal",
    "KotlinInternalInJava"
})
public final class RefreshTokenInterceptor_Factory implements Factory<RefreshTokenInterceptor> {
  private final Provider<TokenManager> tokenManagerProvider;

  private final Provider<AdminApiService> apiServiceProvider;

  public RefreshTokenInterceptor_Factory(Provider<TokenManager> tokenManagerProvider,
      Provider<AdminApiService> apiServiceProvider) {
    this.tokenManagerProvider = tokenManagerProvider;
    this.apiServiceProvider = apiServiceProvider;
  }

  @Override
  public RefreshTokenInterceptor get() {
    return newInstance(tokenManagerProvider.get(), DoubleCheck.lazy(apiServiceProvider));
  }

  public static RefreshTokenInterceptor_Factory create(Provider<TokenManager> tokenManagerProvider,
      Provider<AdminApiService> apiServiceProvider) {
    return new RefreshTokenInterceptor_Factory(tokenManagerProvider, apiServiceProvider);
  }

  public static RefreshTokenInterceptor newInstance(TokenManager tokenManager,
      Lazy<AdminApiService> apiService) {
    return new RefreshTokenInterceptor(tokenManager, apiService);
  }
}
