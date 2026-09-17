-if class com.northend.admin.data.remote.models.WhatsAppMessage
-keepnames class com.northend.admin.data.remote.models.WhatsAppMessage
-if class com.northend.admin.data.remote.models.WhatsAppMessage
-keep class com.northend.admin.data.remote.models.WhatsAppMessageJsonAdapter {
    public <init>(com.squareup.moshi.Moshi);
}
-if class com.northend.admin.data.remote.models.WhatsAppMessage
-keepnames class kotlin.jvm.internal.DefaultConstructorMarker
-if class com.northend.admin.data.remote.models.WhatsAppMessage
-keepclassmembers class com.northend.admin.data.remote.models.WhatsAppMessage {
    public synthetic <init>(java.lang.String,java.lang.String,java.lang.String,java.lang.String,java.lang.String,java.lang.String,java.lang.String,int,kotlin.jvm.internal.DefaultConstructorMarker);
}
