-if class com.northend.admin.data.remote.StudentStatement
-keepnames class com.northend.admin.data.remote.StudentStatement
-if class com.northend.admin.data.remote.StudentStatement
-keep class com.northend.admin.data.remote.StudentStatementJsonAdapter {
    public <init>(com.squareup.moshi.Moshi);
}
-if class com.northend.admin.data.remote.StudentStatement
-keepnames class kotlin.jvm.internal.DefaultConstructorMarker
-if class com.northend.admin.data.remote.StudentStatement
-keepclassmembers class com.northend.admin.data.remote.StudentStatement {
    public synthetic <init>(com.northend.admin.data.remote.models.Student,double,double,double,double,double,double,double,java.util.List,int,kotlin.jvm.internal.DefaultConstructorMarker);
}
