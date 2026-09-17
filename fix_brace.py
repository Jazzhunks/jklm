with open('android-admin/app/src/main/java/com/northend/admin/ui/MainActivity.kt', 'r') as f:
    lines = f.readlines()

# Remove the extra brace at the end
if lines[-2].strip() == '}':
    lines.pop(-2)

with open('android-admin/app/src/main/java/com/northend/admin/ui/MainActivity.kt', 'w') as f:
    f.writelines(lines)
