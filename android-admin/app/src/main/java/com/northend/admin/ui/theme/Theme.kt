package com.northend.admin.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightScheme = lightColorScheme(
    primary = Color(0xFF1A73E8),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFD3E3FD),
    onPrimaryContainer = Color(0xFF00296E),
    secondary = Color(0xFF5F6368),
    onSecondary = Color.White,
    surface = Color(0xFFFAFAFA),
    onSurface = Color(0xFF1A1A1A),
    background = Color(0xFFF5F5F5),
    onBackground = Color(0xFF1A1A1A),
    error = Color(0xFFD93025),
    onError = Color.White
)

private val DarkScheme = darkColorScheme(
    primary = Color(0xFF8AB4F8),
    onPrimary = Color(0xFF00296E),
    primaryContainer = Color(0xFF003A87),
    onPrimaryContainer = Color(0xFFD3E3FD),
    secondary = Color(0xFF9AA0A6),
    onSecondary = Color(0xFF1A1A1A),
    surface = Color(0xFF121212),
    onSurface = Color(0xFFE6E6E6),
    background = Color(0xFF0D0D0D),
    onBackground = Color(0xFFE6E6E6),
    error = Color(0xFFF28B82),
    onError = Color(0xFF1A1A1A)
)

@Composable
fun NorthEndTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightScheme,
        typography = androidx.compose.material3.Typography(),
        content = content
    )
}
