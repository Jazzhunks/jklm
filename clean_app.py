with open('/Users/mudasirmushtaq/Documents/app/northend/frontend/src/App.js', 'r') as f:
    app = f.read()

bad_hook = """
  React.useEffect(() => {
    // Attempt to request Firebase Web Push permission on load
    requestFirebaseNotificationPermission().catch(console.error);
  }, []);
"""
app = app.replace(bad_hook, "")

with open('/Users/mudasirmushtaq/Documents/app/northend/frontend/src/App.js', 'w') as f:
    f.write(app)
