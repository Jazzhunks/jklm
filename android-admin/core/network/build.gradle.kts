plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
    id("dagger.hilt.android.plugin")
    id("kotlin-kapt")
}

android {
    namespace = "com.northend.admin.core.network"
    compileSdk = 34
    defaultConfig {
        minSdk = 26
    }
}

dependencies {
    implementation(libs.retrofit)
    implementation(libs.retrofit.moshi)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)
    implementation(libs.moshi.kotlin)
    kapt(libs.moshi.codegen)
    implementation(libs.hilt.android)
    kapt(libs.hilt.compiler)
    implementation(project(":core:domain"))
}
