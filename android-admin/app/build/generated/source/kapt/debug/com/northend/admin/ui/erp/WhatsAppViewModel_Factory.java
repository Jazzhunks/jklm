package com.northend.admin.ui.erp;

import com.northend.admin.data.repository.AdminRepository;
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
public final class WhatsAppViewModel_Factory implements Factory<WhatsAppViewModel> {
  private final Provider<AdminRepository> repositoryProvider;

  public WhatsAppViewModel_Factory(Provider<AdminRepository> repositoryProvider) {
    this.repositoryProvider = repositoryProvider;
  }

  @Override
  public WhatsAppViewModel get() {
    return newInstance(repositoryProvider.get());
  }

  public static WhatsAppViewModel_Factory create(Provider<AdminRepository> repositoryProvider) {
    return new WhatsAppViewModel_Factory(repositoryProvider);
  }

  public static WhatsAppViewModel newInstance(AdminRepository repository) {
    return new WhatsAppViewModel(repository);
  }
}
