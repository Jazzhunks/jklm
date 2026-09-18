package com.northend.admin.data.local.room;

import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;
import kotlinx.coroutines.flow.Flow;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000,\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0000\n\u0002\u0010\u0002\n\u0002\b\u0005\bg\u0018\u00002\u00020\u0001J\u0014\u0010\u0002\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\u00050\u00040\u0003H\'J\u001c\u0010\u0006\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\u00070\u00040\u00032\u0006\u0010\b\u001a\u00020\tH\'J\u001c\u0010\n\u001a\u00020\u000b2\f\u0010\f\u001a\b\u0012\u0004\u0012\u00020\u00070\u0004H\u00a7@\u00a2\u0006\u0002\u0010\rJ\u001c\u0010\u000e\u001a\u00020\u000b2\f\u0010\u000f\u001a\b\u0012\u0004\u0012\u00020\u00050\u0004H\u00a7@\u00a2\u0006\u0002\u0010\r\u00f8\u0001\u0000\u0082\u0002\u0006\n\u0004\b!0\u0001\u00a8\u0006\u0010\u00c0\u0006\u0001"}, d2 = {"Lcom/northend/admin/data/local/room/WhatsAppDao;", "", "getAllThreads", "Lkotlinx/coroutines/flow/Flow;", "", "Lcom/northend/admin/data/local/room/ThreadEntity;", "getMessagesForThread", "Lcom/northend/admin/data/local/room/MessageEntity;", "threadId", "", "insertMessages", "", "messages", "(Ljava/util/List;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "insertThreads", "threads", "app_debug"})
@androidx.room.Dao()
public abstract interface WhatsAppDao {
    
    @androidx.room.Query(value = "SELECT * FROM whatsapp_threads ORDER BY lastMessageAt DESC")
    @org.jetbrains.annotations.NotNull()
    public abstract kotlinx.coroutines.flow.Flow<java.util.List<com.northend.admin.data.local.room.ThreadEntity>> getAllThreads();
    
    @androidx.room.Insert(onConflict = 1)
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object insertThreads(@org.jetbrains.annotations.NotNull()
    java.util.List<com.northend.admin.data.local.room.ThreadEntity> threads, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion);
    
    @androidx.room.Query(value = "SELECT * FROM whatsapp_messages WHERE threadId = :threadId ORDER BY timestamp ASC")
    @org.jetbrains.annotations.NotNull()
    public abstract kotlinx.coroutines.flow.Flow<java.util.List<com.northend.admin.data.local.room.MessageEntity>> getMessagesForThread(@org.jetbrains.annotations.NotNull()
    java.lang.String threadId);
    
    @androidx.room.Insert(onConflict = 1)
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object insertMessages(@org.jetbrains.annotations.NotNull()
    java.util.List<com.northend.admin.data.local.room.MessageEntity> messages, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion);
}