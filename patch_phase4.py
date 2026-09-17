import os

def create_screen(filename, screen_name, title):
    content = f"""package com.northend.admin.ui.erp

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun {screen_name}() {{
    Scaffold(
        topBar = {{ TopAppBar(title = {{ Text("{title}") }}) }}
    ) {{ padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {{
            Text("{title} native screen is active.", style = MaterialTheme.typography.titleMedium)
            Text("Module syncing...", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }}
    }}
}}
"""
    with open(f'/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/erp/{filename}', 'w') as f:
        f.write(content)

create_screen("WathScreen.kt", "WathScreen", "WATH Exams")
create_screen("ScholarshipsScreen.kt", "ScholarshipsScreen", "Scholarships")
create_screen("GalleryScreen.kt", "GalleryScreen", "Content Gallery")

# Update Nav Drawer
with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/erp/nav/ErpNavDrawer.kt', 'r') as f:
    nav = f.read()

nav = nav.replace('object ErpDestinations {', 
                  'object ErpDestinations {\n    const val WATH = "wath"\n    const val SCHOLARSHIPS = "scholarships"\n    const val GALLERY = "gallery"')

nav = nav.replace('add(DrawerItem(ErpDestinations.DASHBOARD, "Dashboard", Icons.Default.Dashboard) { true })',
                  'add(DrawerItem(ErpDestinations.DASHBOARD, "Dashboard", Icons.Default.Dashboard) { true })\n        add(DrawerItem(ErpDestinations.WATH, "WATH Exams", Icons.Default.Assignment) { true })\n        add(DrawerItem(ErpDestinations.SCHOLARSHIPS, "Scholarships", Icons.Default.School) { true })\n        add(DrawerItem(ErpDestinations.GALLERY, "Gallery", Icons.Default.Dashboard) { true })')

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/erp/nav/ErpNavDrawer.kt', 'w') as f:
    f.write(nav)

# Update AppNavHost
with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/erp/ErpScreen.kt', 'r') as f:
    erp = f.read()

routes = """
                    composable(ErpDestinations.WATH) { WathScreen() }
                    composable(ErpDestinations.SCHOLARSHIPS) { ScholarshipsScreen() }
                    composable(ErpDestinations.GALLERY) { GalleryScreen() }
"""
erp = erp.replace('composable(ErpDestinations.ATTENDANCE) { AttendanceScreen() }',
                  'composable(ErpDestinations.ATTENDANCE) { AttendanceScreen() }' + routes)

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/java/com/northend/admin/ui/erp/ErpScreen.kt', 'w') as f:
    f.write(erp)

print("Phase 4 screens scaffolded.")
