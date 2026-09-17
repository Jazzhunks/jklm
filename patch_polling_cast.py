with open('android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppViewModel.kt', 'r') as f:
    vm = f.read()

vm = vm.replace('threadsResult.data', '(threadsResult.data as List<com.northend.admin.data.remote.models.WhatsAppThread>)')
vm = vm.replace('msgsResult.data', '(msgsResult.data as List<com.northend.admin.data.remote.models.WhatsAppMessage>)')

with open('android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppViewModel.kt', 'w') as f:
    f.write(vm)
