package com.northend.admin.data.repository;

import com.northend.admin.data.local.TokenManager;
import com.northend.admin.data.local.room.WhatsAppDao;
import com.northend.admin.data.remote.AdminApiService;
import dagger.internal.DaggerGenerated;
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
public final class AdminRepository_Factory implements Factory<AdminRepository> {
  private final Provider<AdminApiService> apiServiceProvider;

  private final Provider<TokenManager> tokenManagerProvider;

  private final Provider<WhatsAppDao> whatsAppDaoProvider;

  public AdminRepository_Factory(Provider<AdminApiService> apiServiceProvider,
      Provider<TokenManager> tokenManagerProvider, Provider<WhatsAppDao> whatsAppDaoProvider) {
    this.apiServiceProvider = apiServiceProvider;
    this.tokenManagerProvider = tokenManagerProvider;
    this.whatsAppDaoProvider = whatsAppDaoProvider;
  }

  @Override
  public AdminRepository get() {
    return newInstance(apiServiceProvider.get(), tokenManagerProvider.get(), whatsAppDaoProvider.get());
  }

  public static AdminRepository_Factory create(Provider<AdminApiService> apiServiceProvider,
      Provider<TokenManager> tokenManagerProvider, Provider<WhatsAppDao> whatsAppDaoProvider) {
    return new AdminRepository_Factory(apiServiceProvider, tokenManagerProvider, whatsAppDaoProvider);
  }

  public static AdminRepository newInstance(AdminApiService apiService, TokenManager tokenManager,
      WhatsAppDao whatsAppDao) {
    return new AdminRepository(apiService, tokenManager, whatsAppDao);
  }
}
