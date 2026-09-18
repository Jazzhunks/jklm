with open("android-admin/build.gradle.kts", "r") as f:
    text = f.read()

# Merge plugins blocks in root
new_root = """plugins {
    id("com.android.application") version "8.2.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.22" apply false
    id("com.google.dagger.hilt.android") version "2.48" apply false
    id("com.google.devtools.ksp") version "1.9.22-1.0.17" apply false
    alias(libs.plugins.detekt)
}

subprojects {
    apply(plugin = "io.gitlab.arturbosch.detekt")
    
    detekt {
        buildUponDefaultConfig = true
        allRules = false
    }
}
"""
with open("android-admin/build.gradle.kts", "w") as f:
    f.write(new_root)

with open("android-admin/app/build.gradle.kts", "r") as f:
    text = f.read()

text = text.replace('kapt(libs.room.compiler)', 'ksp(libs.room.compiler)')
text = text.replace('id("kotlin-kapt")', 'id("kotlin-kapt")\n    id("com.google.devtools.ksp")')

with open("android-admin/app/build.gradle.kts", "w") as f:
    f.write(text)
