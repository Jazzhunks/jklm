-if class com.northend.admin.data.remote.LeadTransferRequest
-keepnames class com.northend.admin.data.remote.LeadTransferRequest
-if class com.northend.admin.data.remote.LeadTransferRequest
-keep class com.northend.admin.data.remote.LeadTransferRequestJsonAdapter {
    public <init>(com.squareup.moshi.Moshi);
}
-if class com.northend.admin.data.remote.LeadTransferRequest
-keepnames class kotlin.jvm.internal.DefaultConstructorMarker
-if class com.northend.admin.data.remote.LeadTransferRequest
-keepclassmembers class com.northend.admin.data.remote.LeadTransferRequest {
    public synthetic <init>(java.lang.String,java.lang.String,int,kotlin.jvm.internal.DefaultConstructorMarker);
}
