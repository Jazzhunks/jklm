package com.northend.admin.di;

import com.northend.admin.data.local.TokenManager;
import com.northend.admin.data.local.room.WhatsAppDao;
import com.northend.admin.data.remote.AdminApiService;
import com.northend.admin.data.repository.AdminRepository;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.Preconditions;
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
public final class NetworkModule_ProvideAdminRepositoryFactory implements Factory<AdminRepository> {
  private final Provider<AdminApiService> apiServiceProvider;

  private final Provider<TokenManager> tokenManagerProvider;

  private final Provider<WhatsAppDao> whatsAppDaoProvider;

  public NetworkModule_ProvideAdminRepositoryFactory(Provider<AdminApiService> apiServiceProvider,
      Provider<TokenManager> tokenManagerProvider, Provider<WhatsAppDao> whatsAppDaoProvider) {
    this.apiServiceProvider = apiServiceProvider;
    this.tokenManagerProvider = tokenManagerProvider;
    this.whatsAppDaoProvider = whatsAppDaoProvider;
  }

  @Override
  public AdminRepository get() {
    return provideAdminRepository(apiServiceProvider.get(), tokenManagerProvider.get(), whatsAppDaoProvider.get());
  }

  public static NetworkModule_ProvideAdminRepositoryFactory create(
      Provider<AdminApiService> apiServiceProvider, Provider<TokenManager> tokenManagerProvider,
      Provider<WhatsAppDao> whatsAppDaoProvider) {
    return new NetworkModule_ProvideAdminRepositoryFactory(apiServiceProvider, tokenManagerProvider, whatsAppDaoProvider);
  }

  public static AdminRepository provideAdminRepository(AdminApiService apiService,
      TokenManager tokenManager, WhatsAppDao whatsAppDao) {
    return Preconditions.checkNotNullFromProvides(NetworkModule.INSTANCE.provideAdminRepository(apiService, tokenManager, whatsAppDao));
  }
}
