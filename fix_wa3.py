with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "r") as f:
    text = f.read()

text = text.replace("AnimatedPane {", "")
text = text.replace("        detailPane = {", "        detailPane = {\n")
text = text.replace("                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {\n                        Text(\"Select a conversation\", color = MaterialTheme.colorScheme.onSurfaceVariant)\n                    }\n                }", "                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {\n                        Text(\"Select a conversation\", color = MaterialTheme.colorScheme.onSurfaceVariant)\n                    }")
text = text.replace("            }\n        },", "        },")

# For the role, let's use ListDetailPaneScaffoldRole.Detail and import it, since it is an alias for ThreePaneScaffoldRole.Primary in newer versions. Wait, let me just try ListDetailPaneScaffoldRole again, BUT I'll change it from .Detail to what might work. 
# Wait, I'll use `androidx.compose.material3.adaptive.layout.ThreePaneScaffoldRole.Primary` but maybe it's `androidx.compose.material3.adaptive.layout.ThreePaneScaffoldRole.Companion.Primary` or maybe it's just `androidx.compose.material3.adaptive.layout.ListDetailPaneScaffoldRole.Detail` again.

# Let's import ThreePaneScaffoldRole and use ThreePaneScaffoldRole.Primary.
text = text.replace("ThreePaneScaffoldRole.Primary", "androidx.compose.material3.adaptive.layout.ThreePaneScaffoldRole.Primary")

with open("android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt", "w") as f:
    f.write(text)

