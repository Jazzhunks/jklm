package com.northend.admin.di;

import com.northend.admin.data.local.room.WhatsAppDao;
import com.northend.admin.data.local.room.WhatsAppDatabase;
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
public final class DatabaseModule_ProvideWhatsAppDaoFactory implements Factory<WhatsAppDao> {
  private final Provider<WhatsAppDatabase> databaseProvider;

  public DatabaseModule_ProvideWhatsAppDaoFactory(Provider<WhatsAppDatabase> databaseProvider) {
    this.databaseProvider = databaseProvider;
  }

  @Override
  public WhatsAppDao get() {
    return provideWhatsAppDao(databaseProvider.get());
  }

  public static DatabaseModule_ProvideWhatsAppDaoFactory create(
      Provider<WhatsAppDatabase> databaseProvider) {
    return new DatabaseModule_ProvideWhatsAppDaoFactory(databaseProvider);
  }

  public static WhatsAppDao provideWhatsAppDao(WhatsAppDatabase database) {
    return Preconditions.checkNotNullFromProvides(DatabaseModule.INSTANCE.provideWhatsAppDao(database));
  }
}
