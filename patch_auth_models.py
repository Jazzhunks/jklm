import re

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/data/remote/models/AuthModels.kt', 'a') as f:
    f.write("""

data class SendOtpRequest(
    val identifier: String,
    val action: String = "login"
)

data class SendOtpResponse(
    val message: String
)

data class VerifyOtpRequest(
    val identifier: String,
    val code: String,
    val action: String = "login"
)
""")

print("AuthModels patched")
