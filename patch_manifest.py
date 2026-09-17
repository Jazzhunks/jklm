with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/AndroidManifest.xml', 'r') as f:
    manifest = f.read()

service_tag = """
        <service
            android:name=".service.MyFirebaseMessagingService"
            android:exported="true">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>
"""

# Insert before closing </application> tag
manifest = manifest.replace('</application>', service_tag + '\n    </application>')

with open('/Users/mudasirmushtaq/Documents/app/northend/android-admin/app/src/main/AndroidManifest.xml', 'w') as f:
    f.write(manifest)

print("Manifest patched")
