package com.northend.admin.data.local

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.northend.admin.utils.Constants
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TokenManager @Inject constructor(
    @ApplicationContext context: Context
) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs = EncryptedSharedPreferences.create(
        context,
        Constants.PREF_NAME,
        masterKey,
        androidx.security.crypto.EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        androidx.security.crypto.EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun getAccessToken(): String? = prefs.getString(Constants.PREF_ACCESS_TOKEN, null)
    fun getRefreshToken(): String? = prefs.getString(Constants.PREF_REFRESH_TOKEN, null)

    fun saveTokens(access: String, refresh: String?) {
        prefs.edit()
            .putString(Constants.PREF_ACCESS_TOKEN, access)
            .putString(Constants.PREF_REFRESH_TOKEN, refresh)
            .apply()
    }

    fun clearTokens() {
        prefs.edit().clear().apply()
    }

    fun isLoggedIn(): Boolean = getAccessToken() != null
}
