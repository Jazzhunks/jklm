package com.northend.admin.data.local.room;

import androidx.annotation.NonNull;
import androidx.room.DatabaseConfiguration;
import androidx.room.InvalidationTracker;
import androidx.room.RoomDatabase;
import androidx.room.RoomOpenHelper;
import androidx.room.migration.AutoMigrationSpec;
import androidx.room.migration.Migration;
import androidx.room.util.DBUtil;
import androidx.room.util.TableInfo;
import androidx.sqlite.db.SupportSQLiteDatabase;
import androidx.sqlite.db.SupportSQLiteOpenHelper;
import java.lang.Class;
import java.lang.Override;
import java.lang.String;
import java.lang.SuppressWarnings;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.annotation.processing.Generated;

@Generated("androidx.room.RoomProcessor")
@SuppressWarnings({"unchecked", "deprecation"})
public final class WhatsAppDatabase_Impl extends WhatsAppDatabase {
  private volatile WhatsAppDao _whatsAppDao;

  @Override
  @NonNull
  protected SupportSQLiteOpenHelper createOpenHelper(@NonNull final DatabaseConfiguration config) {
    final SupportSQLiteOpenHelper.Callback _openCallback = new RoomOpenHelper(config, new RoomOpenHelper.Delegate(1) {
      @Override
      public void createAllTables(@NonNull final SupportSQLiteDatabase db) {
        db.execSQL("CREATE TABLE IF NOT EXISTS `whatsapp_threads` (`id` TEXT NOT NULL, `phone` TEXT, `contactName` TEXT, `studentName` TEXT, `lastMessagePreview` TEXT, `lastMessageAt` TEXT, `unreadCount` INTEGER NOT NULL, PRIMARY KEY(`id`))");
        db.execSQL("CREATE TABLE IF NOT EXISTS `whatsapp_messages` (`id` TEXT NOT NULL, `threadId` TEXT NOT NULL, `direction` TEXT NOT NULL, `kind` TEXT NOT NULL, `text` TEXT, `status` TEXT, `timestamp` TEXT NOT NULL, PRIMARY KEY(`id`))");
        db.execSQL("CREATE TABLE IF NOT EXISTS room_master_table (id INTEGER PRIMARY KEY,identity_hash TEXT)");
        db.execSQL("INSERT OR REPLACE INTO room_master_table (id,identity_hash) VALUES(42, '7a36eb85a7dd369a6507fafa5cce2db5')");
      }

      @Override
      public void dropAllTables(@NonNull final SupportSQLiteDatabase db) {
        db.execSQL("DROP TABLE IF EXISTS `whatsapp_threads`");
        db.execSQL("DROP TABLE IF EXISTS `whatsapp_messages`");
        final List<? extends RoomDatabase.Callback> _callbacks = mCallbacks;
        if (_callbacks != null) {
          for (RoomDatabase.Callback _callback : _callbacks) {
            _callback.onDestructiveMigration(db);
          }
        }
      }

      @Override
      public void onCreate(@NonNull final SupportSQLiteDatabase db) {
        final List<? extends RoomDatabase.Callback> _callbacks = mCallbacks;
        if (_callbacks != null) {
          for (RoomDatabase.Callback _callback : _callbacks) {
            _callback.onCreate(db);
          }
        }
      }

      @Override
      public void onOpen(@NonNull final SupportSQLiteDatabase db) {
        mDatabase = db;
        internalInitInvalidationTracker(db);
        final List<? extends RoomDatabase.Callback> _callbacks = mCallbacks;
        if (_callbacks != null) {
          for (RoomDatabase.Callback _callback : _callbacks) {
            _callback.onOpen(db);
          }
        }
      }

      @Override
      public void onPreMigrate(@NonNull final SupportSQLiteDatabase db) {
        DBUtil.dropFtsSyncTriggers(db);
      }

      @Override
      public void onPostMigrate(@NonNull final SupportSQLiteDatabase db) {
      }

      @Override
      @NonNull
      public RoomOpenHelper.ValidationResult onValidateSchema(
          @NonNull final SupportSQLiteDatabase db) {
        final HashMap<String, TableInfo.Column> _columnsWhatsappThreads = new HashMap<String, TableInfo.Column>(7);
        _columnsWhatsappThreads.put("id", new TableInfo.Column("id", "TEXT", true, 1, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsWhatsappThreads.put("phone", new TableInfo.Column("phone", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsWhatsappThreads.put("contactName", new TableInfo.Column("contactName", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsWhatsappThreads.put("studentName", new TableInfo.Column("studentName", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsWhatsappThreads.put("lastMessagePreview", new TableInfo.Column("lastMessagePreview", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsWhatsappThreads.put("lastMessageAt", new TableInfo.Column("lastMessageAt", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsWhatsappThreads.put("unreadCount", new TableInfo.Column("unreadCount", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        final HashSet<TableInfo.ForeignKey> _foreignKeysWhatsappThreads = new HashSet<TableInfo.ForeignKey>(0);
        final HashSet<TableInfo.Index> _indicesWhatsappThreads = new HashSet<TableInfo.Index>(0);
        final TableInfo _infoWhatsappThreads = new TableInfo("whatsapp_threads", _columnsWhatsappThreads, _foreignKeysWhatsappThreads, _indicesWhatsappThreads);
        final TableInfo _existingWhatsappThreads = TableInfo.read(db, "whatsapp_threads");
        if (!_infoWhatsappThreads.equals(_existingWhatsappThreads)) {
          return new RoomOpenHelper.ValidationResult(false, "whatsapp_threads(com.northend.admin.data.local.room.ThreadEntity).\n"
                  + " Expected:\n" + _infoWhatsappThreads + "\n"
                  + " Found:\n" + _existingWhatsappThreads);
        }
        final HashMap<String, TableInfo.Column> _columnsWhatsappMessages = new HashMap<String, TableInfo.Column>(7);
        _columnsWhatsappMessages.put("id", new TableInfo.Column("id", "TEXT", true, 1, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsWhatsappMessages.put("threadId", new TableInfo.Column("threadId", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsWhatsappMessages.put("direction", new TableInfo.Column("direction", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsWhatsappMessages.put("kind", new TableInfo.Column("kind", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsWhatsappMessages.put("text", new TableInfo.Column("text", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsWhatsappMessages.put("status", new TableInfo.Column("status", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsWhatsappMessages.put("timestamp", new TableInfo.Column("timestamp", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        final HashSet<TableInfo.ForeignKey> _foreignKeysWhatsappMessages = new HashSet<TableInfo.ForeignKey>(0);
        final HashSet<TableInfo.Index> _indicesWhatsappMessages = new HashSet<TableInfo.Index>(0);
        final TableInfo _infoWhatsappMessages = new TableInfo("whatsapp_messages", _columnsWhatsappMessages, _foreignKeysWhatsappMessages, _indicesWhatsappMessages);
        final TableInfo _existingWhatsappMessages = TableInfo.read(db, "whatsapp_messages");
        if (!_infoWhatsappMessages.equals(_existingWhatsappMessages)) {
          return new RoomOpenHelper.ValidationResult(false, "whatsapp_messages(com.northend.admin.data.local.room.MessageEntity).\n"
                  + " Expected:\n" + _infoWhatsappMessages + "\n"
                  + " Found:\n" + _existingWhatsappMessages);
        }
        return new RoomOpenHelper.ValidationResult(true, null);
      }
    }, "7a36eb85a7dd369a6507fafa5cce2db5", "7c2a670205eef0815f60d0c86d5c632b");
    final SupportSQLiteOpenHelper.Configuration _sqliteConfig = SupportSQLiteOpenHelper.Configuration.builder(config.context).name(config.name).callback(_openCallback).build();
    final SupportSQLiteOpenHelper _helper = config.sqliteOpenHelperFactory.create(_sqliteConfig);
    return _helper;
  }

  @Override
  @NonNull
  protected InvalidationTracker createInvalidationTracker() {
    final HashMap<String, String> _shadowTablesMap = new HashMap<String, String>(0);
    final HashMap<String, Set<String>> _viewTables = new HashMap<String, Set<String>>(0);
    return new InvalidationTracker(this, _shadowTablesMap, _viewTables, "whatsapp_threads","whatsapp_messages");
  }

  @Override
  public void clearAllTables() {
    super.assertNotMainThread();
    final SupportSQLiteDatabase _db = super.getOpenHelper().getWritableDatabase();
    try {
      super.beginTransaction();
      _db.execSQL("DELETE FROM `whatsapp_threads`");
      _db.execSQL("DELETE FROM `whatsapp_messages`");
      super.setTransactionSuccessful();
    } finally {
      super.endTransaction();
      _db.query("PRAGMA wal_checkpoint(FULL)").close();
      if (!_db.inTransaction()) {
        _db.execSQL("VACUUM");
      }
    }
  }

  @Override
  @NonNull
  protected Map<Class<?>, List<Class<?>>> getRequiredTypeConverters() {
    final HashMap<Class<?>, List<Class<?>>> _typeConvertersMap = new HashMap<Class<?>, List<Class<?>>>();
    _typeConvertersMap.put(WhatsAppDao.class, WhatsAppDao_Impl.getRequiredConverters());
    return _typeConvertersMap;
  }

  @Override
  @NonNull
  public Set<Class<? extends AutoMigrationSpec>> getRequiredAutoMigrationSpecs() {
    final HashSet<Class<? extends AutoMigrationSpec>> _autoMigrationSpecsSet = new HashSet<Class<? extends AutoMigrationSpec>>();
    return _autoMigrationSpecsSet;
  }

  @Override
  @NonNull
  public List<Migration> getAutoMigrations(
      @NonNull final Map<Class<? extends AutoMigrationSpec>, AutoMigrationSpec> autoMigrationSpecs) {
    final List<Migration> _autoMigrations = new ArrayList<Migration>();
    return _autoMigrations;
  }

  @Override
  public WhatsAppDao whatsappDao() {
    if (_whatsAppDao != null) {
      return _whatsAppDao;
    } else {
      synchronized(this) {
        if(_whatsAppDao == null) {
          _whatsAppDao = new WhatsAppDao_Impl(this);
        }
        return _whatsAppDao;
      }
    }
  }
}
