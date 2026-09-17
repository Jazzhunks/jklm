with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/erp/nav/ErpNavDrawer.kt', 'r') as f:
    nav = f.read()

nav = nav.replace('import androidx.compose.material.icons.filled.School', 
                  'import androidx.compose.material.icons.filled.School\nimport androidx.compose.material.icons.filled.Message')

nav = nav.replace('const val ID_CARDS = "idcards"', 
                  'const val ID_CARDS = "idcards"\n    const val WHATSAPP = "whatsapp"')

# Insert WhatsApp into the drawer items
wa_item = 'add(DrawerItem(ErpDestinations.WHATSAPP, "WhatsApp Inbox", Icons.Default.Message) { true })'
nav = nav.replace('add(DrawerItem(ErpDestinations.ATTENDANCE, "Gate Attendance", Icons.Default.QrCodeScanner) { true })',
                  wa_item + '\n        add(DrawerItem(ErpDestinations.ATTENDANCE, "Gate Attendance", Icons.Default.QrCodeScanner) { true })')

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/erp/nav/ErpNavDrawer.kt', 'w') as f:
    f.write(nav)

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/erp/ErpScreen.kt', 'r') as f:
    erp = f.read()

wa_route = 'composable(com.northend.admin.ui.erp.nav.ErpDestinations.WHATSAPP) { com.northend.admin.ui.erp.WhatsAppInboxScreen() }'
erp = erp.replace('composable(ErpDestinations.ATTENDANCE) { AttendanceScreen() }',
                  wa_route + '\n                    composable(ErpDestinations.ATTENDANCE) { AttendanceScreen() }')

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/erp/ErpScreen.kt', 'w') as f:
    f.write(erp)

print("Nav patched")
