with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/auth/LoginViewModel.kt', 'r') as f:
    vm = f.read()

vm = vm.replace('is ResultWrapper.Success ->', 'is ResultWrapper.Success<*> ->')

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/auth/LoginViewModel.kt', 'w') as f:
    f.write(vm)

print("VM fixed")
