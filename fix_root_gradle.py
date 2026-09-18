with open("android-admin/build.gradle.kts", "r") as f:
    text = f.read()

text = text.replace('alias(libs.plugins.ksp) apply false', 'id("com.google.devtools.ksp") version "1.9.22-1.0.17" apply false')

with open("android-admin/build.gradle.kts", "w") as f:
    f.write(text)

with open("android-admin/app/build.gradle.kts", "r") as f:
    text = f.read()

text = text.replace('alias(libs.plugins.ksp)', 'id("com.google.devtools.ksp")')

with open("android-admin/app/build.gradle.kts", "w") as f:
    f.write(text)
