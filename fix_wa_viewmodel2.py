with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppViewModel.kt", "r") as f:
    text = f.read()

text = text.replace("import com.northend.admin.data.repository.ResultWrapper", "import com.northend.admin.utils.ResultWrapper")

with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppViewModel.kt", "w") as f:
    f.write(text)
