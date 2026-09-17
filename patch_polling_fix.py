with open('android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppViewModel.kt', 'r') as f:
    vm = f.read()

vm = vm.replace('repository.getWhatsAppThreads()', 'repository.listWhatsAppThreads()')
vm = vm.replace('is com.northend.admin.utils.ResultWrapper.Success', 'is com.northend.admin.utils.ResultWrapper.Success<*>')

with open('android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppViewModel.kt', 'w') as f:
    f.write(vm)
