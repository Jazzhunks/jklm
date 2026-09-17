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
public final class StaffViewModel_Factory implements Factory<StaffViewModel> {
  private final Provider<AdminApiService> apiServiceProvider;

  private final Provider<TokenManager> tokenManagerProvider;

  public StaffViewModel_Factory(Provider<AdminApiService> apiServiceProvider,
      Provider<TokenManager> tokenManagerProvider) {
    this.apiServiceProvider = apiServiceProvider;
    this.tokenManagerProvider = tokenManagerProvider;
  }

  @Override
  public StaffViewModel get() {
    return newInstance(apiServiceProvider.get(), tokenManagerProvider.get());
  }

  public static StaffViewModel_Factory create(Provider<AdminApiService> apiServiceProvider,
      Provider<TokenManager> tokenManagerProvider) {
    return new StaffViewModel_Factory(apiServiceProvider, tokenManagerProvider);
  }

  public static StaffViewModel newInstance(AdminApiService apiService, TokenManager tokenManager) {
    return new StaffViewModel(apiService, tokenManager);
  }
}
