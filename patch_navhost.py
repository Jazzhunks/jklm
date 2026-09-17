with open('android-admin/app/src/main/java/com/northend/admin/ui/AppNavHost.kt', 'r') as f:
    nav = f.read()

import re
nav = re.sub(r'var startDestination by remember \{ mutableStateOf\("login"\) \}.*?LaunchedEffect\(Unit\) \{.*?\}',
             'val startDestination = remember { if (tokenManager.isLoggedIn()) "whatsapp" else "login" }', nav, flags=re.DOTALL)

with open('android-admin/app/src/main/java/com/northend/admin/ui/AppNavHost.kt', 'w') as f:
    f.write(nav)
