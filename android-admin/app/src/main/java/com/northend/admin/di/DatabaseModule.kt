package com.northend.admin.di

import android.content.Context
import androidx.room.Room
import com.northend.admin.data.local.room.WhatsAppDao
import com.northend.admin.data.local.room.WhatsAppDatabase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideWhatsAppDatabase(@ApplicationContext context: Context): WhatsAppDatabase {
        return Room.databaseBuilder(
            context,
            WhatsAppDatabase::class.java,
            "whatsapp_db"
        ).fallbackToDestructiveMigration().build()
    }

    @Provides
    @Singleton
    fun provideWhatsAppDao(database: WhatsAppDatabase): WhatsAppDao {
        return database.whatsappDao()
    }
}
