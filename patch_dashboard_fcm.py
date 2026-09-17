with open('android-admin/app/src/main/java/com/northend/admin/ui/erp/DashboardViewModel.kt', 'r') as f:
    vm = f.read()

fcm_imports = """
import com.google.firebase.messaging.FirebaseMessaging
import android.util.Log
"""
vm = vm.replace('import androidx.lifecycle.ViewModel', fcm_imports + 'import androidx.lifecycle.ViewModel')

fcm_logic = """
            if (meResult is ResultWrapper.Success) {
                user.value = meResult.data
                
                FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        val token = task.result
                        Log.d("FCM", "Fetched token: $token")
                        viewModelScope.launch {
                            repository.updateFcmToken(token)
                        }
                    }
                }
"""

vm = vm.replace('if (meResult is ResultWrapper.Success) {\n                user.value = meResult.data', fcm_logic)

with open('android-admin/app/src/main/java/com/northend/admin/ui/erp/DashboardViewModel.kt', 'w') as f:
    f.write(vm)

print("DashboardViewModel patched")
