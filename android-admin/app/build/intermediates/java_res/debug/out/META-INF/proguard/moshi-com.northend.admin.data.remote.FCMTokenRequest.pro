-if class com.northend.admin.data.remote.FCMTokenRequest
-keepnames class com.northend.admin.data.remote.FCMTokenRequest
-if class com.northend.admin.data.remote.FCMTokenRequest
-keep class com.northend.admin.data.remote.FCMTokenRequestJsonAdapter {
    public <init>(com.squareup.moshi.Moshi);
}
