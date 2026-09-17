with open("android-admin/gradle/libs.versions.toml", 'r') as f:
    lines = f.readlines()

new_lines = []
in_plugins = False
for line in lines:
    if line.strip() == 'detekt = "1.23.4"':
        continue
    if line.strip() == '[plugins]' and in_plugins:
        continue
    if line.strip() == 'detekt = { id = "io.gitlab.arturbosch.detekt", version.ref = "detekt" }':
        continue
    if line.strip() == '[plugins]':
        in_plugins = True
    new_lines.append(line)

with open("android-admin/gradle/libs.versions.toml", 'w') as f:
    f.writelines(new_lines)
    
# manually insert properly
with open("android-admin/gradle/libs.versions.toml", 'r') as f:
    content = f.read()

content = content.replace('[versions]', '[versions]\ndetekt = "1.23.4"')
content = content.replace('[plugins]', '[plugins]\ndetekt = { id = "io.gitlab.arturbosch.detekt", version.ref = "detekt" }')

with open("android-admin/gradle/libs.versions.toml", 'w') as f:
    f.write(content)
