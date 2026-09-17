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
public final class ExpensesViewModel_Factory implements Factory<ExpensesViewModel> {
  private final Provider<AdminRepository> repositoryProvider;

  public ExpensesViewModel_Factory(Provider<AdminRepository> repositoryProvider) {
    this.repositoryProvider = repositoryProvider;
  }

  @Override
  public ExpensesViewModel get() {
    return newInstance(repositoryProvider.get());
  }

  public static ExpensesViewModel_Factory create(Provider<AdminRepository> repositoryProvider) {
    return new ExpensesViewModel_Factory(repositoryProvider);
  }

  public static ExpensesViewModel newInstance(AdminRepository repository) {
    return new ExpensesViewModel(repository);
  }
}
