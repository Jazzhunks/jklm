-if class com.northend.admin.data.remote.PhotoResponse
-keepnames class com.northend.admin.data.remote.PhotoResponse
-if class com.northend.admin.data.remote.PhotoResponse
-keep class com.northend.admin.data.remote.PhotoResponseJsonAdapter {
    public <init>(com.squareup.moshi.Moshi);
}
-if class com.northend.admin.data.remote.PhotoResponse
-keepnames class kotlin.jvm.internal.DefaultConstructorMarker
-if class com.northend.admin.data.remote.PhotoResponse
-keepclassmembers class com.northend.admin.data.remote.PhotoResponse {
    public synthetic <init>(java.lang.String,int,kotlin.jvm.internal.DefaultConstructorMarker);
}
