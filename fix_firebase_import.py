import re

with open('backend/server.py', 'r') as f:
    server = f.read()

server = server.replace('import firebase_admin\nfrom firebase_admin import credentials, messaging', '''
try:
    import firebase_admin
    from firebase_admin import credentials, messaging
except ImportError:
    firebase_admin = None
    credentials = None
    messaging = None
''')

with open('backend/server.py', 'w') as f:
    f.write(server)

with open('backend/whatsapp_inbox.py', 'r') as f:
    wa = f.read()

wa = wa.replace('import firebase_admin', '''
try:
    import firebase_admin
except ImportError:
    firebase_admin = None
''')

with open('backend/whatsapp_inbox.py', 'w') as f:
    f.write(wa)
