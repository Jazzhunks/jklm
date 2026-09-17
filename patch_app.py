with open('/Users/mudasirmushtaq/Documents/app/northend/frontend/src/App.js', 'r') as f:
    app = f.read()

import_statement = "import { requestFirebaseNotificationPermission } from './lib/firebase';\n"
if "requestFirebaseNotificationPermission" not in app:
    app = app.replace('import React', import_statement + 'import React')
    
    # Inject it into a high-level useEffect
    hook_injection = """
  React.useEffect(() => {
    // Attempt to request Firebase Web Push permission on load
    requestFirebaseNotificationPermission().catch(console.error);
  }, []);
"""
    app = app.replace('function App() {', 'function App() {\n' + hook_injection)

with open('/Users/mudasirmushtaq/Documents/app/northend/frontend/src/App.js', 'w') as f:
    f.write(app)

print("App.js patched")
