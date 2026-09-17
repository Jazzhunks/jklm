with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/MainActivity.kt', 'r') as f:
    code = f.read()

# Add the padding modifier import if it doesn't exist
if 'import androidx.compose.foundation.layout.systemBarsPadding' not in code:
    code = code.replace('import androidx.compose.foundation.layout.fillMaxSize', 
                        'import androidx.compose.foundation.layout.fillMaxSize\nimport androidx.compose.foundation.layout.systemBarsPadding')

# Apply it to the AndroidView modifier
code = code.replace('modifier = Modifier.fillMaxSize(),', 'modifier = Modifier.fillMaxSize().systemBarsPadding(),')

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/MainActivity.kt', 'w') as f:
    f.write(code)

print("Status bar fixed")
