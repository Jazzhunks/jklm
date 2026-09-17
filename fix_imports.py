with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/MainActivity.kt', 'r') as f:
    code = f.read()

if 'import android.webkit.SslErrorHandler' not in code:
    code = code.replace('import android.webkit.*', 'import android.webkit.*\nimport android.webkit.SslErrorHandler\nimport android.webkit.ConsoleMessage')

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/MainActivity.kt', 'w') as f:
    f.write(code)
print("Imports fixed")
