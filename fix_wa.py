with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt', 'r') as f:
    wa = f.read()

wa = wa.replace('@Composable\nprivate fun ThreadCard', '@OptIn(ExperimentalMaterial3Api::class)\n@Composable\nprivate fun ThreadCard')

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt', 'w') as f:
    f.write(wa)
print("WA fixed")
