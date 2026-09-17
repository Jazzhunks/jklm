with open('android-admin/app/src/main/java/com/northend/admin/ui/MainActivity.kt', 'r') as f:
    activity = f.read()

import re

# Fix onNewIntent
new_intent_impl = '''    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent) // Security Skill: keep active references updated
        handleIntent(intent)
    }'''
activity = re.sub(r'\s*override fun onNewIntent.*?\}', '\n' + new_intent_impl, activity, flags=re.DOTALL)

# Fix handleIntent parsing
handle_intent_impl = '''
    private fun handleIntent(intent: Intent) {
        try {
            val targetPath = intent.getStringExtra("target_path")
            // Expected format: /admin/whatsapp?thread_id=123
            if (targetPath != null && targetPath.contains("thread_id=")) {
                val parts = targetPath.split("thread_id=")
                if (parts.size > 1 && parts[1].isNotEmpty()) {
                    targetThreadId.value = parts[1]
                }
            }
        } catch (e: Exception) {
            // Handle missing or malformed intent extras gracefully to prevent crashes
        }
    }'''
activity = re.sub(r'\s*private fun handleIntent.*?\}', '\n' + handle_intent_impl, activity, flags=re.DOTALL)

with open('android-admin/app/src/main/java/com/northend/admin/ui/MainActivity.kt', 'w') as f:
    f.write(activity)
