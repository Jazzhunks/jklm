with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/build.gradle.kts', 'r') as f:
    code = f.read()

code = code.replace(
    'id("com.google.dagger.hilt.android") version "2.48" apply false',
    'id("com.google.dagger.hilt.android") version "2.48" apply false\n    id("com.google.gms.google-services") version "4.4.1" apply false'
)

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/build.gradle.kts', 'w') as f:
    f.write(code)

print("Project Gradle patched")
