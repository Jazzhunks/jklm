with open('android-admin/app/src/main/java/com/northend/admin/ui/AppNavHost.kt', 'r') as f:
    nav = f.read()

nav = nav.replace('val startDestination = remember { if (tokenManager.isLoggedIn()) "whatsapp" else "login" }', '''
    val context = LocalContext.current
    val tokenManager = remember { NetworkModule.provideTokenManager(context) }
    val startDestination = remember { if (tokenManager.isLoggedIn()) "whatsapp" else "login" }
''')

with open('android-admin/app/src/main/java/com/northend/admin/ui/AppNavHost.kt', 'w') as f:
    f.write(nav)
