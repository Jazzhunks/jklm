with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/build.gradle.kts', 'r') as f:
    code = f.read()

code = code.replace(
    'id("dagger.hilt.android.plugin")',
    'id("dagger.hilt.android.plugin")\n    id("com.google.gms.google-services")'
)

dependencies = """
    // Firebase
    implementation(platform("com.google.firebase:firebase-bom:32.7.2"))
    implementation("com.google.firebase:firebase-messaging-ktx")
    
    // Testing"""

code = code.replace('    // Testing', dependencies)

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/build.gradle.kts', 'w') as f:
    f.write(code)

print("App Gradle patched")
