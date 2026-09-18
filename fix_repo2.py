with open("android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt", "r") as f:
    repo_text = f.read()

repo_text = repo_text.replace(
    "val entities = response.body()!!.map {",
    "val entities = response.body()!!.items.map {"
)

repo_text = repo_text.replace(
    "threadId = threadId,\n                        content = it.content,\n                        timestamp = it.timestamp,\n                        isFromMe = it.isFromMe,\n                        status = it.status",
    "threadId = it.threadId,\n                        direction = it.direction,\n                        kind = it.kind,\n                        text = it.text,\n                        status = it.status,\n                        timestamp = it.timestamp"
)

with open("android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt", "w") as f:
    f.write(repo_text)
