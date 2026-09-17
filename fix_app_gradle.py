with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/build.gradle.kts', 'r') as f:
    code = f.read()

code = code.replace(
    'id("com.google.gms.google-services")',
    'id("com.google.gms.google-services") version "4.4.1"'
)

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/build.gradle.kts', 'w') as f:
    f.write(code)

print("App Gradle fixed")
