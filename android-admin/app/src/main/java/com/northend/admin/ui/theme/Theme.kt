package com.northend.admin.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val LightScheme = lightColorScheme(
    primary = Color(0xFF075E54), // WhatsApp Teal
    onPrimary = Color.White,
    primaryContainer = Color(0xFFDCF8C6), // WhatsApp Outgoing
    onPrimaryContainer = Color(0xFF003D33),
    secondary = Color(0xFF25D366), // WhatsApp Light Green
    onSecondary = Color.White,
    surface = Color(0xFFFAFAFA),
    onSurface = Color(0xFF1A1A1A),
    background = Color(0xFFECE5DD), // WhatsApp Chat Bg
    onBackground = Color(0xFF1A1A1A),
    error = Color(0xFFD93025),
    onError = Color.White
)

private val DarkScheme = darkColorScheme(
    primary = Color(0xFF00A884), // WhatsApp Dark Teal
    onPrimary = Color(0xFF1F2C34),
    primaryContainer = Color(0xFF005C4B),
    onPrimaryContainer = Color(0xFFE9EDEF),
    secondary = Color(0xFF00A884),
    onSecondary = Color(0xFF1F2C34),
    surface = Color(0xFF111B21), // WhatsApp Dark Surface
    onSurface = Color(0xFFE9EDEF),
    background = Color(0xFF0B141A), // WhatsApp Dark Bg
    onBackground = Color(0xFFE9EDEF),
    error = Color(0xFFF28B82),
    onError = Color(0xFF1F2C34)
)

@Composable
fun NorthEndTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkScheme
        else -> LightScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = androidx.compose.material3.Typography(),
        content = content
    )
}
