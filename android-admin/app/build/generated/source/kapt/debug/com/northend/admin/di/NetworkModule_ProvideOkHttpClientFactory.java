package com.northend.admin.di;

import com.northend.admin.data.local.TokenManager;
import com.northend.admin.data.remote.AdminApiService;
import dagger.Lazy;
import dagger.internal.DaggerGenerated;
import dagger.internal.DoubleCheck;
import dagger.internal.Factory;
import dagger.internal.Preconditions;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;
import okhttp3.OkHttpClient;

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
public final class NetworkModule_ProvideOkHttpClientFactory implements Factory<OkHttpClient> {
  private final Provider<TokenManager> tokenManagerProvider;

  private final Provider<AdminApiService> apiServiceProvider;

  public NetworkModule_ProvideOkHttpClientFactory(Provider<TokenManager> tokenManagerProvider,
      Provider<AdminApiService> apiServiceProvider) {
    this.tokenManagerProvider = tokenManagerProvider;
    this.apiServiceProvider = apiServiceProvider;
  }

  @Override
  public OkHttpClient get() {
    return provideOkHttpClient(tokenManagerProvider.get(), DoubleCheck.lazy(apiServiceProvider));
  }

  public static NetworkModule_ProvideOkHttpClientFactory create(
      Provider<TokenManager> tokenManagerProvider, Provider<AdminApiService> apiServiceProvider) {
    return new NetworkModule_ProvideOkHttpClientFactory(tokenManagerProvider, apiServiceProvider);
  }

  public static OkHttpClient provideOkHttpClient(TokenManager tokenManager,
      Lazy<AdminApiService> apiService) {
    return Preconditions.checkNotNullFromProvides(NetworkModule.INSTANCE.provideOkHttpClient(tokenManager, apiService));
  }
}
