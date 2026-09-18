package com.northend.admin.data.local.room;

import android.database.Cursor;
import androidx.annotation.NonNull;
import androidx.room.CoroutinesRoom;
import androidx.room.EntityInsertionAdapter;
import androidx.room.RoomDatabase;
import androidx.room.RoomSQLiteQuery;
import androidx.room.util.CursorUtil;
import androidx.room.util.DBUtil;
import androidx.sqlite.db.SupportSQLiteStatement;
import java.lang.Class;
import java.lang.Exception;
import java.lang.Object;
import java.lang.Override;
import java.lang.String;
import java.lang.SuppressWarnings;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Callable;
import javax.annotation.processing.Generated;
import kotlin.Unit;
import kotlin.coroutines.Continuation;
import kotlinx.coroutines.flow.Flow;

@Generated("androidx.room.RoomProcessor")
@SuppressWarnings({"unchecked", "deprecation"})
public final class WhatsAppDao_Impl implements WhatsAppDao {
  private final RoomDatabase __db;

  private final EntityInsertionAdapter<ThreadEntity> __insertionAdapterOfThreadEntity;

  private final EntityInsertionAdapter<MessageEntity> __insertionAdapterOfMessageEntity;

  public WhatsAppDao_Impl(@NonNull final RoomDatabase __db) {
    this.__db = __db;
    this.__insertionAdapterOfThreadEntity = new EntityInsertionAdapter<ThreadEntity>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "INSERT OR REPLACE INTO `whatsapp_threads` (`id`,`phone`,`contactName`,`studentName`,`lastMessagePreview`,`lastMessageAt`,`unreadCount`) VALUES (?,?,?,?,?,?,?)";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final ThreadEntity entity) {
        if (entity.getId() == null) {
          statement.bindNull(1);
        } else {
          statement.bindString(1, entity.getId());
        }
        if (entity.getPhone() == null) {
          statement.bindNull(2);
        } else {
          statement.bindString(2, entity.getPhone());
        }
        if (entity.getContactName() == null) {
          statement.bindNull(3);
        } else {
          statement.bindString(3, entity.getContactName());
        }
        if (entity.getStudentName() == null) {
          statement.bindNull(4);
        } else {
          statement.bindString(4, entity.getStudentName());
        }
        if (entity.getLastMessagePreview() == null) {
          statement.bindNull(5);
        } else {
          statement.bindString(5, entity.getLastMessagePreview());
        }
        if (entity.getLastMessageAt() == null) {
          statement.bindNull(6);
        } else {
          statement.bindString(6, entity.getLastMessageAt());
        }
        statement.bindLong(7, entity.getUnreadCount());
      }
    };
    this.__insertionAdapterOfMessageEntity = new EntityInsertionAdapter<MessageEntity>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "INSERT OR REPLACE INTO `whatsapp_messages` (`id`,`threadId`,`direction`,`kind`,`text`,`status`,`timestamp`) VALUES (?,?,?,?,?,?,?)";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final MessageEntity entity) {
        if (entity.getId() == null) {
          statement.bindNull(1);
        } else {
          statement.bindString(1, entity.getId());
        }
        if (entity.getThreadId() == null) {
          statement.bindNull(2);
        } else {
          statement.bindString(2, entity.getThreadId());
        }
        if (entity.getDirection() == null) {
          statement.bindNull(3);
        } else {
          statement.bindString(3, entity.getDirection());
        }
        if (entity.getKind() == null) {
          statement.bindNull(4);
        } else {
          statement.bindString(4, entity.getKind());
        }
        if (entity.getText() == null) {
          statement.bindNull(5);
        } else {
          statement.bindString(5, entity.getText());
        }
        if (entity.getStatus() == null) {
          statement.bindNull(6);
        } else {
          statement.bindString(6, entity.getStatus());
        }
        if (entity.getTimestamp() == null) {
          statement.bindNull(7);
        } else {
          statement.bindString(7, entity.getTimestamp());
        }
      }
    };
  }

  @Override
  public Object insertThreads(final List<ThreadEntity> threads,
      final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        __db.beginTransaction();
        try {
          __insertionAdapterOfThreadEntity.insert(threads);
          __db.setTransactionSuccessful();
          return Unit.INSTANCE;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @Override
  public Object insertMessages(final List<MessageEntity> messages,
      final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        __db.beginTransaction();
        try {
          __insertionAdapterOfMessageEntity.insert(messages);
          __db.setTransactionSuccessful();
          return Unit.INSTANCE;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @Override
  public Flow<List<ThreadEntity>> getAllThreads() {
    final String _sql = "SELECT * FROM whatsapp_threads ORDER BY lastMessageAt DESC";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 0);
    return CoroutinesRoom.createFlow(__db, false, new String[] {"whatsapp_threads"}, new Callable<List<ThreadEntity>>() {
      @Override
      @NonNull
      public List<ThreadEntity> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "id");
          final int _cursorIndexOfPhone = CursorUtil.getColumnIndexOrThrow(_cursor, "phone");
          final int _cursorIndexOfContactName = CursorUtil.getColumnIndexOrThrow(_cursor, "contactName");
          final int _cursorIndexOfStudentName = CursorUtil.getColumnIndexOrThrow(_cursor, "studentName");
          final int _cursorIndexOfLastMessagePreview = CursorUtil.getColumnIndexOrThrow(_cursor, "lastMessagePreview");
          final int _cursorIndexOfLastMessageAt = CursorUtil.getColumnIndexOrThrow(_cursor, "lastMessageAt");
          final int _cursorIndexOfUnreadCount = CursorUtil.getColumnIndexOrThrow(_cursor, "unreadCount");
          final List<ThreadEntity> _result = new ArrayList<ThreadEntity>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final ThreadEntity _item;
            final String _tmpId;
            if (_cursor.isNull(_cursorIndexOfId)) {
              _tmpId = null;
            } else {
              _tmpId = _cursor.getString(_cursorIndexOfId);
            }
            final String _tmpPhone;
            if (_cursor.isNull(_cursorIndexOfPhone)) {
              _tmpPhone = null;
            } else {
              _tmpPhone = _cursor.getString(_cursorIndexOfPhone);
            }
            final String _tmpContactName;
            if (_cursor.isNull(_cursorIndexOfContactName)) {
              _tmpContactName = null;
            } else {
              _tmpContactName = _cursor.getString(_cursorIndexOfContactName);
            }
            final String _tmpStudentName;
            if (_cursor.isNull(_cursorIndexOfStudentName)) {
              _tmpStudentName = null;
            } else {
              _tmpStudentName = _cursor.getString(_cursorIndexOfStudentName);
            }
            final String _tmpLastMessagePreview;
            if (_cursor.isNull(_cursorIndexOfLastMessagePreview)) {
              _tmpLastMessagePreview = null;
            } else {
              _tmpLastMessagePreview = _cursor.getString(_cursorIndexOfLastMessagePreview);
            }
            final String _tmpLastMessageAt;
            if (_cursor.isNull(_cursorIndexOfLastMessageAt)) {
              _tmpLastMessageAt = null;
            } else {
              _tmpLastMessageAt = _cursor.getString(_cursorIndexOfLastMessageAt);
            }
            final int _tmpUnreadCount;
            _tmpUnreadCount = _cursor.getInt(_cursorIndexOfUnreadCount);
            _item = new ThreadEntity(_tmpId,_tmpPhone,_tmpContactName,_tmpStudentName,_tmpLastMessagePreview,_tmpLastMessageAt,_tmpUnreadCount);
            _result.add(_item);
          }
          return _result;
        } finally {
          _cursor.close();
        }
      }

      @Override
      protected void finalize() {
        _statement.release();
      }
    });
  }

  @Override
  public Flow<List<MessageEntity>> getMessagesForThread(final String threadId) {
    final String _sql = "SELECT * FROM whatsapp_messages WHERE threadId = ? ORDER BY timestamp ASC";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    if (threadId == null) {
      _statement.bindNull(_argIndex);
    } else {
      _statement.bindString(_argIndex, threadId);
    }
    return CoroutinesRoom.createFlow(__db, false, new String[] {"whatsapp_messages"}, new Callable<List<MessageEntity>>() {
      @Override
      @NonNull
      public List<MessageEntity> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "id");
          final int _cursorIndexOfThreadId = CursorUtil.getColumnIndexOrThrow(_cursor, "threadId");
          final int _cursorIndexOfDirection = CursorUtil.getColumnIndexOrThrow(_cursor, "direction");
          final int _cursorIndexOfKind = CursorUtil.getColumnIndexOrThrow(_cursor, "kind");
          final int _cursorIndexOfText = CursorUtil.getColumnIndexOrThrow(_cursor, "text");
          final int _cursorIndexOfStatus = CursorUtil.getColumnIndexOrThrow(_cursor, "status");
          final int _cursorIndexOfTimestamp = CursorUtil.getColumnIndexOrThrow(_cursor, "timestamp");
          final List<MessageEntity> _result = new ArrayList<MessageEntity>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final MessageEntity _item;
            final String _tmpId;
            if (_cursor.isNull(_cursorIndexOfId)) {
              _tmpId = null;
            } else {
              _tmpId = _cursor.getString(_cursorIndexOfId);
            }
            final String _tmpThreadId;
            if (_cursor.isNull(_cursorIndexOfThreadId)) {
              _tmpThreadId = null;
            } else {
              _tmpThreadId = _cursor.getString(_cursorIndexOfThreadId);
            }
            final String _tmpDirection;
            if (_cursor.isNull(_cursorIndexOfDirection)) {
              _tmpDirection = null;
            } else {
              _tmpDirection = _cursor.getString(_cursorIndexOfDirection);
            }
            final String _tmpKind;
            if (_cursor.isNull(_cursorIndexOfKind)) {
              _tmpKind = null;
            } else {
              _tmpKind = _cursor.getString(_cursorIndexOfKind);
            }
            final String _tmpText;
            if (_cursor.isNull(_cursorIndexOfText)) {
              _tmpText = null;
            } else {
              _tmpText = _cursor.getString(_cursorIndexOfText);
            }
            final String _tmpStatus;
            if (_cursor.isNull(_cursorIndexOfStatus)) {
              _tmpStatus = null;
            } else {
              _tmpStatus = _cursor.getString(_cursorIndexOfStatus);
            }
            final String _tmpTimestamp;
            if (_cursor.isNull(_cursorIndexOfTimestamp)) {
              _tmpTimestamp = null;
            } else {
              _tmpTimestamp = _cursor.getString(_cursorIndexOfTimestamp);
            }
            _item = new MessageEntity(_tmpId,_tmpThreadId,_tmpDirection,_tmpKind,_tmpText,_tmpStatus,_tmpTimestamp);
            _result.add(_item);
          }
          return _result;
        } finally {
          _cursor.close();
        }
      }

      @Override
      protected void finalize() {
        _statement.release();
      }
    });
  }

  @NonNull
  public static List<Class<?>> getRequiredConverters() {
    return Collections.emptyList();
  }
}
