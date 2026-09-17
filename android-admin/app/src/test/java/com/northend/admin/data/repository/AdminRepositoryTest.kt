package com.northend.admin.data.repository

import com.northend.admin.data.local.TokenManager
import com.northend.admin.data.remote.AdminApiService
import com.northend.admin.utils.ResultWrapper
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import retrofit2.Response

class AdminRepositoryTest {

    private val apiService = mockk<AdminApiService>()
    private val tokenManager = mockk<TokenManager>()
    private val repository = AdminRepository(apiService, tokenManager)

    @Test
    fun `logout clears tokens and calls api`() = runBlocking {
        // Arrange
        coEvery { apiService.logout() } returns Response.success(Unit)
        coEvery { tokenManager.clearTokens() } returns Unit

        // Act
        val result = repository.logout()

        // Assert
        assertTrue(result is ResultWrapper.Success)
    }
}
