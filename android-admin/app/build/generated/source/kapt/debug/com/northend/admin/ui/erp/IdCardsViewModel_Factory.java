package com.northend.admin.ui.erp;

import com.northend.admin.data.local.TokenManager;
import com.northend.admin.data.remote.AdminApiService;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata
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
public final class IdCardsViewModel_Factory implements Factory<IdCardsViewModel> {
  private final Provider<AdminApiService> apiServiceProvider;

  private final Provider<TokenManager> tokenManagerProvider;

  public IdCardsViewModel_Factory(Provider<AdminApiService> apiServiceProvider,
      Provider<TokenManager> tokenManagerProvider) {
    this.apiServiceProvider = apiServiceProvider;
    this.tokenManagerProvider = tokenManagerProvider;
  }

  @Override
  public IdCardsViewModel get() {
    return newInstance(apiServiceProvider.get(), tokenManagerProvider.get());
  }

  public static IdCardsViewModel_Factory create(Provider<AdminApiService> apiServiceProvider,
      Provider<TokenManager> tokenManagerProvider) {
    return new IdCardsViewModel_Factory(apiServiceProvider, tokenManagerProvider);
  }

  public static IdCardsViewModel newInstance(AdminApiService apiService,
      TokenManager tokenManager) {
    return new IdCardsViewModel(apiService, tokenManager);
  }
}
