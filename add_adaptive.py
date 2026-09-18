with open("android-admin/gradle/libs.versions.toml", "r") as f:
    text = f.read()

text = text.replace('composeMaterial3 = "1.1.2"', 'composeMaterial3 = "1.1.2"\nadaptive = "1.0.0-beta03"')

libraries = """androidx-compose-material3-adaptive = { group = "androidx.compose.material3.adaptive", name = "adaptive", version.ref = "adaptive" }
androidx-compose-material3-adaptive-layout = { group = "androidx.compose.material3.adaptive", name = "adaptive-layout", version.ref = "adaptive" }
androidx-compose-material3-adaptive-navigation = { group = "androidx.compose.material3.adaptive", name = "adaptive-navigation", version.ref = "adaptive" }
"""

text = text.replace('androidx-compose-material3 = { group = "androidx.compose.material3", name = "material3", version.ref = "composeMaterial3" }', 'androidx-compose-material3 = { group = "androidx.compose.material3", name = "material3", version.ref = "composeMaterial3" }\n' + libraries)

with open("android-admin/gradle/libs.versions.toml", "w") as f:
    f.write(text)

with open("android-admin/app/build.gradle.kts", "r") as f:
    app_gradle = f.read()

deps = """    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material3.adaptive)
    implementation(libs.androidx.compose.material3.adaptive.layout)
    implementation(libs.androidx.compose.material3.adaptive.navigation)"""

app_gradle = app_gradle.replace('    implementation(libs.androidx.compose.material3)', deps)

with open("android-admin/app/build.gradle.kts", "w") as f:
    f.write(app_gradle)

