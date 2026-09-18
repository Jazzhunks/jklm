with open("android-admin/app/build.gradle.kts", "r") as f:
    text = f.read()

text = text.replace('kapt(libs.hilt.compiler)', 'kapt(libs.hilt.compiler)\n}\n\nkapt {\n    correctErrorTypes = true\n')

with open("android-admin/app/build.gradle.kts", "w") as f:
    f.write(text)
