with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/MainActivity.kt', 'r') as f:
    code = f.read()

code = code.replace('private var initialUrl = "https://northendedu.com/admin"', 'private var initialUrl = "https://northendedu.com/"')

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/MainActivity.kt', 'w') as f:
    f.write(code)
print("URL fixed")
