with open("android-admin/app/src/main/java/com/northend/admin/di/NetworkModule.kt", "r") as f:
    text = f.read()

text = text.replace('import com.northend.admin.data.local.TokenManager', 'import com.northend.admin.data.local.TokenManager\nimport com.northend.admin.data.local.room.WhatsAppDao')

text = text.replace("""    @Provides
    @Singleton
    fun provideAdminRepository(
        apiService: AdminApiService,
        tokenManager: TokenManager
    ): AdminRepository = AdminRepository(apiService, tokenManager)""", """    @Provides
    @Singleton
    fun provideAdminRepository(
        apiService: AdminApiService,
        tokenManager: TokenManager,
        whatsAppDao: WhatsAppDao
    ): AdminRepository = AdminRepository(apiService, tokenManager, whatsAppDao)""")

with open("android-admin/app/src/main/java/com/northend/admin/di/NetworkModule.kt", "w") as f:
    f.write(text)
