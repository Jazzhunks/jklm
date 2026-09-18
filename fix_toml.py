import re

with open('android-admin/gradle/libs.versions.toml', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.strip() == 'room = "2.6.1"' or line.strip() == 'ksp = "1.9.22-1.0.17"' or line.strip() == '[libraries]' or line.strip() == 'room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }' or line.strip() == 'room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }' or line.strip() == 'room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }' or line.strip() == '[plugins]' or line.strip() == 'ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }':
        continue
    new_lines.append(line)

out = ""
for line in new_lines:
    if line.strip() == "[libraries]":
        out += 'room = "2.6.1"\n'
        out += 'ksp = "1.9.22-1.0.17"\n\n'
    out += line
    if line.strip() == "[libraries]":
        out += 'room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }\n'
        out += 'room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }\n'
        out += 'room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }\n'
    if line.strip() == "[plugins]":
        out += 'ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }\n'

with open('android-admin/gradle/libs.versions.toml', 'w') as f:
    f.write(out)

