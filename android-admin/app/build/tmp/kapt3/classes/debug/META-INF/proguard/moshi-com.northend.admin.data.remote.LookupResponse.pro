-if class com.northend.admin.data.remote.LookupResponse
-keepnames class com.northend.admin.data.remote.LookupResponse
-if class com.northend.admin.data.remote.LookupResponse
-keep class com.northend.admin.data.remote.LookupResponseJsonAdapter {
    public <init>(com.squareup.moshi.Moshi);
}
-if class com.northend.admin.data.remote.LookupResponse
-keepnames class kotlin.jvm.internal.DefaultConstructorMarker
-if class com.northend.admin.data.remote.LookupResponse
-keepclassmembers class com.northend.admin.data.remote.LookupResponse {
    public synthetic <init>(java.lang.String,java.util.Map,int,kotlin.jvm.internal.DefaultConstructorMarker);
}
