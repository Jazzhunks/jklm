with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "r") as f:
    text = f.read()

# Replace SwipeToDismiss block with just ThreadCard
import re

start_str = "            items(threads, key = { it.id }) { thread ->"
end_str = "                )\n            }\n        }"

start_idx = text.find(start_str)
end_idx = text.find(end_str, start_idx) + len(end_str)

new_block = """            items(threads) { thread ->
                ThreadCard(
                    thread = thread,
                    isSelected = thread.id == selectedThreadId,
                    onClick = { onThreadSelect(thread) }
                )
            }
        }"""

text = text[:start_idx] + new_block + text[end_idx:]

with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "w") as f:
    f.write(text)

