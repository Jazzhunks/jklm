with open('android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt', 'r') as f:
    screen = f.read()

# Add Modifier.imePadding() to the bottomBar Box
screen = screen.replace('bottomBar = {\n                MessageInput { text -> viewModel.sendMessage(text) }\n            }', '''bottomBar = {
                Box(modifier = Modifier.imePadding().navigationBarsPadding()) {
                    MessageInput { text -> viewModel.sendMessage(text) }
                }
            }''')

with open('android-admin/app/src/main/java/com/northend/admin/ui/erp/WhatsAppInboxScreen.kt', 'w') as f:
    f.write(screen)
