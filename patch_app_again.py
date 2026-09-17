with open('/Users/mudasirmushtaq/Documents/app/northend/frontend/src/App.js', 'r') as f:
    app = f.read()

import_statement = "import { requestFirebaseNotificationPermission } from './lib/firebase';\nimport { useEffect } from 'react';\n"
app = import_statement + app

hook_injection = """
  useEffect(() => {
    requestFirebaseNotificationPermission().catch(console.error);
  }, []);
"""
app = app.replace('function App() {', 'function App() {\n' + hook_injection)

with open('/Users/mudasirmushtaq/Documents/app/northend/frontend/src/App.js', 'w') as f:
    f.write(app)

print("App.js patched correctly")
