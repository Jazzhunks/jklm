-if class com.northend.admin.data.remote.models.WhatsAppThread
-keepnames class com.northend.admin.data.remote.models.WhatsAppThread
-if class com.northend.admin.data.remote.models.WhatsAppThread
-keep class com.northend.admin.data.remote.models.WhatsAppThreadJsonAdapter {
    public <init>(com.squareup.moshi.Moshi);
}
-if class com.northend.admin.data.remote.models.WhatsAppThread
-keepnames class kotlin.jvm.internal.DefaultConstructorMarker
-if class com.northend.admin.data.remote.models.WhatsAppThread
-keepclassmembers class com.northend.admin.data.remote.models.WhatsAppThread {
    public synthetic <init>(java.lang.String,java.lang.String,java.lang.String,java.lang.String,java.lang.String,java.lang.String,int,java.util.List,int,kotlin.jvm.internal.DefaultConstructorMarker);
}
