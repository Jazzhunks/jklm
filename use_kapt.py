with open("android-admin/app/build.gradle.kts", "r") as f:
    text = f.read()

text = text.replace('id("com.google.devtools.ksp")', '')
text = text.replace('ksp(libs.room.compiler)', 'kapt(libs.room.compiler)')

with open("android-admin/app/build.gradle.kts", "w") as f:
    f.write(text)

with open("android-admin/build.gradle.kts", "r") as f:
    text = f.read()

text = text.replace('id("com.google.devtools.ksp") version "1.9.22-1.0.17" apply false', '')

with open("android-admin/build.gradle.kts", "w") as f:
    f.write(text)
