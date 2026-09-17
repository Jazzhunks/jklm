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
public final class StudentsViewModel_Factory implements Factory<StudentsViewModel> {
  private final Provider<AdminRepository> repositoryProvider;

  public StudentsViewModel_Factory(Provider<AdminRepository> repositoryProvider) {
    this.repositoryProvider = repositoryProvider;
  }

  @Override
  public StudentsViewModel get() {
    return newInstance(repositoryProvider.get());
  }

  public static StudentsViewModel_Factory create(Provider<AdminRepository> repositoryProvider) {
    return new StudentsViewModel_Factory(repositoryProvider);
  }

  public static StudentsViewModel newInstance(AdminRepository repository) {
    return new StudentsViewModel(repository);
  }
}
