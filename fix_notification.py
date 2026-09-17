with open('backend/server.py', 'r') as f:
    server = f.read()

server = server.replace('async def send_super_admin_notification(title: str, body: str, target_path: str = ""):\n    try:', '''async def send_super_admin_notification(title: str, body: str, target_path: str = ""):
    if messaging is None:
        print("FCM not configured")
        return
    try:''')

with open('backend/server.py', 'w') as f:
    f.write(server)
