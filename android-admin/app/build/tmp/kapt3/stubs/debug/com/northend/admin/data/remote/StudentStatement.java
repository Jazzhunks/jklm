package com.northend.admin.data.remote;

import com.northend.admin.data.remote.models.*;
import retrofit2.Response;
import retrofit2.http.*;
import com.squareup.moshi.Json;
import com.squareup.moshi.JsonClass;

@com.squareup.moshi.JsonClass(generateAdapter = true)
@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00008\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u0006\n\u0002\b\u0007\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0002\b\u0018\n\u0002\u0010\u000b\n\u0002\b\u0002\n\u0002\u0010\b\n\u0000\n\u0002\u0010\u000e\n\u0000\b\u0087\b\u0018\u00002\u00020\u0001Ba\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\b\b\u0001\u0010\u0004\u001a\u00020\u0005\u0012\b\b\u0001\u0010\u0006\u001a\u00020\u0005\u0012\b\b\u0001\u0010\u0007\u001a\u00020\u0005\u0012\b\b\u0002\u0010\b\u001a\u00020\u0005\u0012\b\b\u0001\u0010\t\u001a\u00020\u0005\u0012\b\b\u0001\u0010\n\u001a\u00020\u0005\u0012\u0006\u0010\u000b\u001a\u00020\u0005\u0012\u000e\b\u0002\u0010\f\u001a\b\u0012\u0004\u0012\u00020\u000e0\r\u00a2\u0006\u0002\u0010\u000fJ\t\u0010\u001c\u001a\u00020\u0003H\u00c6\u0003J\t\u0010\u001d\u001a\u00020\u0005H\u00c6\u0003J\t\u0010\u001e\u001a\u00020\u0005H\u00c6\u0003J\t\u0010\u001f\u001a\u00020\u0005H\u00c6\u0003J\t\u0010 \u001a\u00020\u0005H\u00c6\u0003J\t\u0010!\u001a\u00020\u0005H\u00c6\u0003J\t\u0010\"\u001a\u00020\u0005H\u00c6\u0003J\t\u0010#\u001a\u00020\u0005H\u00c6\u0003J\u000f\u0010$\u001a\b\u0012\u0004\u0012\u00020\u000e0\rH\u00c6\u0003Ji\u0010%\u001a\u00020\u00002\b\b\u0002\u0010\u0002\u001a\u00020\u00032\b\b\u0003\u0010\u0004\u001a\u00020\u00052\b\b\u0003\u0010\u0006\u001a\u00020\u00052\b\b\u0003\u0010\u0007\u001a\u00020\u00052\b\b\u0002\u0010\b\u001a\u00020\u00052\b\b\u0003\u0010\t\u001a\u00020\u00052\b\b\u0003\u0010\n\u001a\u00020\u00052\b\b\u0002\u0010\u000b\u001a\u00020\u00052\u000e\b\u0002\u0010\f\u001a\b\u0012\u0004\u0012\u00020\u000e0\rH\u00c6\u0001J\u0013\u0010&\u001a\u00020\'2\b\u0010(\u001a\u0004\u0018\u00010\u0001H\u00d6\u0003J\t\u0010)\u001a\u00020*H\u00d6\u0001J\t\u0010+\u001a\u00020,H\u00d6\u0001R\u0011\u0010\b\u001a\u00020\u0005\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0010\u0010\u0011R\u0011\u0010\t\u001a\u00020\u0005\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0012\u0010\u0011R\u0017\u0010\f\u001a\b\u0012\u0004\u0012\u00020\u000e0\r\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0013\u0010\u0014R\u0011\u0010\u000b\u001a\u00020\u0005\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0015\u0010\u0011R\u0011\u0010\u0007\u001a\u00020\u0005\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0016\u0010\u0011R\u0011\u0010\u0006\u001a\u00020\u0005\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0017\u0010\u0011R\u0011\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0018\u0010\u0019R\u0011\u0010\u0004\u001a\u00020\u0005\u00a2\u0006\b\n\u0000\u001a\u0004\b\u001a\u0010\u0011R\u0011\u0010\n\u001a\u00020\u0005\u00a2\u0006\b\n\u0000\u001a\u0004\b\u001b\u0010\u0011\u00a8\u0006-"}, d2 = {"Lcom/northend/admin/data/remote/StudentStatement;", "", "student", "Lcom/northend/admin/data/remote/models/Student;", "totalFee", "", "scholarshipPercent", "scholarshipAmount", "discount", "netFee", "totalPaid", "pending", "payments", "", "Lcom/northend/admin/data/remote/models/Payment;", "(Lcom/northend/admin/data/remote/models/Student;DDDDDDDLjava/util/List;)V", "getDiscount", "()D", "getNetFee", "getPayments", "()Ljava/util/List;", "getPending", "getScholarshipAmount", "getScholarshipPercent", "getStudent", "()Lcom/northend/admin/data/remote/models/Student;", "getTotalFee", "getTotalPaid", "component1", "component2", "component3", "component4", "component5", "component6", "component7", "component8", "component9", "copy", "equals", "", "other", "hashCode", "", "toString", "", "app_debug"})
public final class StudentStatement {
    @org.jetbrains.annotations.NotNull()
    private final com.northend.admin.data.remote.models.Student student = null;
    private final double totalFee = 0.0;
    private final double scholarshipPercent = 0.0;
    private final double scholarshipAmount = 0.0;
    private final double discount = 0.0;
    private final double netFee = 0.0;
    private final double totalPaid = 0.0;
    private final double pending = 0.0;
    @org.jetbrains.annotations.NotNull()
    private final java.util.List<com.northend.admin.data.remote.models.Payment> payments = null;
    
    public StudentStatement(@org.jetbrains.annotations.NotNull()
    com.northend.admin.data.remote.models.Student student, @com.squareup.moshi.Json(name = "total_fee")
    double totalFee, @com.squareup.moshi.Json(name = "scholarship_percent")
    double scholarshipPercent, @com.squareup.moshi.Json(name = "scholarship_amount")
    double scholarshipAmount, double discount, @com.squareup.moshi.Json(name = "net_fee")
    double netFee, @com.squareup.moshi.Json(name = "total_paid")
    double totalPaid, double pending, @org.jetbrains.annotations.NotNull()
    java.util.List<com.northend.admin.data.remote.models.Payment> payments) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.northend.admin.data.remote.models.Student getStudent() {
        return null;
    }
    
    public final double getTotalFee() {
        return 0.0;
    }
    
    public final double getScholarshipPercent() {
        return 0.0;
    }
    
    public final double getScholarshipAmount() {
        return 0.0;
    }
    
    public final double getDiscount() {
        return 0.0;
    }
    
    public final double getNetFee() {
        return 0.0;
    }
    
    public final double getTotalPaid() {
        return 0.0;
    }
    
    public final double getPending() {
        return 0.0;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<com.northend.admin.data.remote.models.Payment> getPayments() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.northend.admin.data.remote.models.Student component1() {
        return null;
    }
    
    public final double component2() {
        return 0.0;
    }
    
    public final double component3() {
        return 0.0;
    }
    
    public final double component4() {
        return 0.0;
    }
    
    public final double component5() {
        return 0.0;
    }
    
    public final double component6() {
        return 0.0;
    }
    
    public final double component7() {
        return 0.0;
    }
    
    public final double component8() {
        return 0.0;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<com.northend.admin.data.remote.models.Payment> component9() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.northend.admin.data.remote.StudentStatement copy(@org.jetbrains.annotations.NotNull()
    com.northend.admin.data.remote.models.Student student, @com.squareup.moshi.Json(name = "total_fee")
    double totalFee, @com.squareup.moshi.Json(name = "scholarship_percent")
    double scholarshipPercent, @com.squareup.moshi.Json(name = "scholarship_amount")
    double scholarshipAmount, double discount, @com.squareup.moshi.Json(name = "net_fee")
    double netFee, @com.squareup.moshi.Json(name = "total_paid")
    double totalPaid, double pending, @org.jetbrains.annotations.NotNull()
    java.util.List<com.northend.admin.data.remote.models.Payment> payments) {
        return null;
    }
    
    @java.lang.Override()
    public boolean equals(@org.jetbrains.annotations.Nullable()
    java.lang.Object other) {
        return false;
    }
    
    @java.lang.Override()
    public int hashCode() {
        return 0;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.NotNull()
    public java.lang.String toString() {
        return null;
    }
}