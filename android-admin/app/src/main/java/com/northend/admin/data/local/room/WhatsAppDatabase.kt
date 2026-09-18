package com.northend.admin.data.local.room

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(entities = [ThreadEntity::class, MessageEntity::class], version = 1, exportSchema = false)
abstract class WhatsAppDatabase : RoomDatabase() {
    abstract fun whatsappDao(): WhatsAppDao
}
