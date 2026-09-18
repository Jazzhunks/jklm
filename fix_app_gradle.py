with open("android-admin/app/build.gradle.kts", "r") as f:
    text = f.read()

# Insert ksp plugin
text = text.replace('id("kotlin-kapt")', 'id("kotlin-kapt")\n    alias(libs.plugins.ksp)')

# Insert Room dependencies
deps = """
    // Room Database
    implementation(libs.room.runtime)
    implementation(libs.room.ktx)
    ksp(libs.room.compiler)

    // Core"""
text = text.replace('    // Core', deps)

with open("android-admin/app/build.gradle.kts", "w") as f:
    f.write(text)
