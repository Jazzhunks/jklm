with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt', 'r') as f:
    ui = f.read()

ui = ui.replace('thread.contactName ?: thread.phone', 'thread.contactName ?: thread.phone ?: "Unknown Number"')
ui = ui.replace('state.currentThread!!.contactName ?: state.currentThread!!.phone', 'state.currentThread!!.contactName ?: state.currentThread!!.phone ?: "Unknown Number"')

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt', 'w') as f:
    f.write(ui)
print("UI fixed")
