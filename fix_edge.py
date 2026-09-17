import re
with open('android-admin/app/src/main/java/com/northend/admin/ui/MainActivity.kt', 'r') as f:
    activity = f.read()

activity = activity.replace('import androidx.core.view.WindowCompat', 'import androidx.activity.enableEdgeToEdge')
activity = activity.replace('WindowCompat.setDecorFitsSystemWindows(window, false)', 'enableEdgeToEdge()')

with open('android-admin/app/src/main/java/com/northend/admin/ui/MainActivity.kt', 'w') as f:
    f.write(activity)
