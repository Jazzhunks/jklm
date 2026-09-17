with open('android-admin/app/src/main/java/com/northend/admin/data/remote/RefreshTokenInterceptor.kt', 'r') as f:
    interceptor = f.read()

import re

# Remove the peekBody line
interceptor = re.sub(r'val body = response\.peekBody\(Long\.MAX_VALUE\)\.string\(\)\s*', '', interceptor)

# Add response.close() before chain.proceed(newRequest)
interceptor = interceptor.replace('chain.proceed(newRequest)', 'response.close()\n                        chain.proceed(newRequest)')

with open('android-admin/app/src/main/java/com/northend/admin/data/remote/RefreshTokenInterceptor.kt', 'w') as f:
    f.write(interceptor)
