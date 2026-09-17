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
public final class LeadsViewModel_Factory implements Factory<LeadsViewModel> {
  private final Provider<AdminRepository> repositoryProvider;

  public LeadsViewModel_Factory(Provider<AdminRepository> repositoryProvider) {
    this.repositoryProvider = repositoryProvider;
  }

  @Override
  public LeadsViewModel get() {
    return newInstance(repositoryProvider.get());
  }

  public static LeadsViewModel_Factory create(Provider<AdminRepository> repositoryProvider) {
    return new LeadsViewModel_Factory(repositoryProvider);
  }

  public static LeadsViewModel newInstance(AdminRepository repository) {
    return new LeadsViewModel(repository);
  }
}
