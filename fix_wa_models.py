with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/data/remote/models/WhatsAppModels.kt', 'r') as f:
    models = f.read()

models = models.replace(
    'val phone: String,',
    '@Json(name = "wa_id") val phone: String? = null,'
)
models = models.replace(
    '@Json(name = "contact_name") val contactName: String? = null,',
    '@Json(name = "profile_name") val contactName: String? = null,'
)
models = models.replace(
    '@Json(name = "student_name") val studentName: String? = null,',
    '@Json(name = "linked_name") val studentName: String? = null,'
)

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/data/remote/models/WhatsAppModels.kt', 'w') as f:
    f.write(models)
print("Models fixed")
