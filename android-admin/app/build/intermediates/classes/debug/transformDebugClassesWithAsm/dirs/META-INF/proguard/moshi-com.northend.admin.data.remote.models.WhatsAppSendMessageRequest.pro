-if class com.northend.admin.data.remote.models.WhatsAppSendMessageRequest
-keepnames class com.northend.admin.data.remote.models.WhatsAppSendMessageRequest
-if class com.northend.admin.data.remote.models.WhatsAppSendMessageRequest
-keep class com.northend.admin.data.remote.models.WhatsAppSendMessageRequestJsonAdapter {
    public <init>(com.squareup.moshi.Moshi);
}
-if class com.northend.admin.data.remote.models.WhatsAppSendMessageRequest
-keepnames class kotlin.jvm.internal.DefaultConstructorMarker
-if class com.northend.admin.data.remote.models.WhatsAppSendMessageRequest
-keepclassmembers class com.northend.admin.data.remote.models.WhatsAppSendMessageRequest {
    public synthetic <init>(java.lang.String,java.lang.String,int,kotlin.jvm.internal.DefaultConstructorMarker);
}
