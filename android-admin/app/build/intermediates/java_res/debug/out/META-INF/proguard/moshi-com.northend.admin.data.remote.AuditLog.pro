-if class com.northend.admin.data.remote.AuditLog
-keepnames class com.northend.admin.data.remote.AuditLog
-if class com.northend.admin.data.remote.AuditLog
-keep class com.northend.admin.data.remote.AuditLogJsonAdapter {
    public <init>(com.squareup.moshi.Moshi);
}
-if class com.northend.admin.data.remote.AuditLog
-keepnames class kotlin.jvm.internal.DefaultConstructorMarker
-if class com.northend.admin.data.remote.AuditLog
-keepclassmembers class com.northend.admin.data.remote.AuditLog {
    public synthetic <init>(java.lang.String,java.lang.String,java.lang.String,java.lang.String,java.lang.String,java.lang.String,java.lang.String,java.lang.String,java.util.Map,java.lang.String,int,kotlin.jvm.internal.DefaultConstructorMarker);
}
