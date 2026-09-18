package com.northend.admin.di;

import android.content.Context;
import com.northend.admin.data.local.room.WhatsAppDatabase;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.Preconditions;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata("javax.inject.Singleton")
@QualifierMetadata("dagger.hilt.android.qualifiers.ApplicationContext")
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
public final class DatabaseModule_ProvideWhatsAppDatabaseFactory implements Factory<WhatsAppDatabase> {
  private final Provider<Context> contextProvider;

  public DatabaseModule_ProvideWhatsAppDatabaseFactory(Provider<Context> contextProvider) {
    this.contextProvider = contextProvider;
  }

  @Override
  public WhatsAppDatabase get() {
    return provideWhatsAppDatabase(contextProvider.get());
  }

  public static DatabaseModule_ProvideWhatsAppDatabaseFactory create(
      Provider<Context> contextProvider) {
    return new DatabaseModule_ProvideWhatsAppDatabaseFactory(contextProvider);
  }

  public static WhatsAppDatabase provideWhatsAppDatabase(Context context) {
    return Preconditions.checkNotNullFromProvides(DatabaseModule.INSTANCE.provideWhatsAppDatabase(context));
  }
}
