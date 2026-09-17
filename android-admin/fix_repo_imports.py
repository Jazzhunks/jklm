with open('android-admin/app/src/main/java/com/northend/admin/data/remote/AdminApiService.kt', 'r') as f:
    api = f.read()

api = api.replace('com.northend.admin.data.remote.models.FCMTokenRequest', 'com.northend.admin.data.remote.FCMTokenRequest')

with open('android-admin/app/src/main/java/com/northend/admin/data/remote/AdminApiService.kt', 'w') as f:
    f.write(api)

with open('android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt', 'r') as f:
    repo = f.read()

repo = repo.replace('com.northend.admin.data.remote.models.FCMTokenRequest', 'com.northend.admin.data.remote.FCMTokenRequest')

with open('android-admin/app/src/main/java/com/northend/admin/data/repository/AdminRepository.kt', 'w') as f:
    f.write(repo)
