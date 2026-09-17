with open('android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppViewModel.kt', 'r') as f:
    vm = f.read()

fcm_func = """
    fun updateFcmToken(token: String) {
        viewModelScope.launch {
            repository.updateFcmToken(token)
        }
    }
"""
if "updateFcmToken" not in vm:
    vm = vm.replace('fun loadThreads() {', fcm_func + '\n    fun loadThreads() {')

with open('android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppViewModel.kt', 'w') as f:
    f.write(vm)

with open('android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt', 'r') as f:
    wa = f.read()

wa = wa.replace('// Actually, DashboardViewModel was calling this. I\'ll add `updateFcmToken` to WhatsAppViewModel.', 'viewModel.updateFcmToken(token)')
with open('android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt', 'w') as f:
    f.write(wa)

print("WhatsAppViewModel patched with FCM token updater")
