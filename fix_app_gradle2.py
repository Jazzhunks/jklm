with open("android-admin/app/build.gradle.kts", "r") as f:
    text = f.read()

# I will just write a python script to replace the messed up block
fixed = text.replace("""    kapt(libs.hilt.compiler)
}

kapt {
    correctErrorTypes = true

    implementation(libs.hilt.navigation.compose)""", """    kapt(libs.hilt.compiler)
    implementation(libs.hilt.navigation.compose)""")

fixed = fixed + "\n\nkapt {\n    correctErrorTypes = true\n}\n"

with open("android-admin/app/build.gradle.kts", "w") as f:
    f.write(fixed)
