with open('android-admin/app/src/main/AndroidManifest.xml', 'r') as f:
    manifest = f.read()

import re
manifest = re.sub(r'<receiver.*?>.*?</receiver>', '', manifest, flags=re.DOTALL)

with open('android-admin/app/src/main/AndroidManifest.xml', 'w') as f:
    f.write(manifest)
