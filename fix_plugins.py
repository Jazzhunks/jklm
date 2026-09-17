import os, glob

for f in glob.glob("android-admin/core/*/build.gradle.kts"):
    with open(f, 'r') as file:
        content = file.read()
    content = content.replace('alias(libs.plugins.android.library)', 'id("com.android.library")')
    content = content.replace('alias(libs.plugins.kotlin.android)', 'id("org.jetbrains.kotlin.android")')
    content = content.replace('alias(libs.plugins.hilt)', 'id("dagger.hilt.android.plugin")')
    content = content.replace('alias(libs.plugins.kotlin.kapt)', 'id("kotlin-kapt")')
    with open(f, 'w') as file:
        file.write(content)
