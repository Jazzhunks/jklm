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
public final class PaymentsViewModel_Factory implements Factory<PaymentsViewModel> {
  private final Provider<AdminRepository> repositoryProvider;

  public PaymentsViewModel_Factory(Provider<AdminRepository> repositoryProvider) {
    this.repositoryProvider = repositoryProvider;
  }

  @Override
  public PaymentsViewModel get() {
    return newInstance(repositoryProvider.get());
  }

  public static PaymentsViewModel_Factory create(Provider<AdminRepository> repositoryProvider) {
    return new PaymentsViewModel_Factory(repositoryProvider);
  }

  public static PaymentsViewModel newInstance(AdminRepository repository) {
    return new PaymentsViewModel(repository);
  }
}
