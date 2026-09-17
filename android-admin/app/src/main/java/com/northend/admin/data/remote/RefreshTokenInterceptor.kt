package com.northend.admin.data.remote

import com.northend.admin.data.local.TokenManager
import com.northend.admin.data.remote.LoginRequest
import com.northend.admin.data.remote.RefreshRequest
import dagger.Lazy
import kotlinx.coroutines.runBlocking
import okhttp3.*
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class RefreshTokenInterceptor @Inject constructor(
    private val tokenManager: TokenManager,
    private val apiService: Lazy<AdminApiService>
) : Interceptor {

    @Volatile
    private var isRefreshing = false
    private val lock = Any()

    @Throws(IOException::class)
    override fun intercept(chain: Interceptor.Chain): Response {
        val response = chain.proceed(chain.request())

        val body = response.peekBody(Long.MAX_VALUE).string()

        return if (response.code == 401 && !isAuthEndpoint(chain.request())) {
            synchronized(lock) {
                if (isRefreshing) return response
                isRefreshing = true
                try {
                    val refreshToken = tokenManager.getRefreshToken() ?: return response
                    val refreshResponse = runBlocking {
                        apiService.get().refresh(RefreshRequest(refreshToken))
                    }
                    if (refreshResponse.isSuccessful) {
                        refreshResponse.body()?.let { tokenManager.saveTokens(it.accessToken, it.refreshToken ?: refreshToken) }
                        val newToken = tokenManager.getAccessToken()
                        val newRequest = chain.request().newBuilder()
                            .removeHeader("Authorization")
                            .addHeader("Authorization", "Bearer $newToken")
                            .build()
                        chain.proceed(newRequest)
                    } else {
                        tokenManager.clearTokens()
                        response
                    }
                } finally {
                    isRefreshing = false
                }
            }
        } else {
            response
        }
    }

    private fun isAuthEndpoint(request: Request): Boolean {
        val path = request.url.encodedPath
        return path.contains("/auth/refresh") || path.contains("/auth/login")
    }
}
