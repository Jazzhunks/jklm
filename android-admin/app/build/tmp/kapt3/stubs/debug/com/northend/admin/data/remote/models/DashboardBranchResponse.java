package com.northend.admin.data.remote.models;

import com.squareup.moshi.Json;
import com.squareup.moshi.JsonClass;
import com.northend.admin.data.remote.Branch;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000D\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u0006\n\u0002\b\u0003\n\u0002\u0010\b\n\u0002\b\u0002\n\u0002\u0010$\n\u0002\u0010\u000e\n\u0000\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u001a\n\u0002\u0010\u000b\n\u0002\b\u0004\b\u0086\b\u0018\u00002\u00020\u0001By\u0012\n\b\u0002\u0010\u0002\u001a\u0004\u0018\u00010\u0003\u0012\b\b\u0002\u0010\u0004\u001a\u00020\u0005\u0012\b\b\u0002\u0010\u0006\u001a\u00020\u0005\u0012\b\b\u0003\u0010\u0007\u001a\u00020\u0005\u0012\b\b\u0003\u0010\b\u001a\u00020\t\u0012\b\b\u0003\u0010\n\u001a\u00020\t\u0012\u0014\b\u0003\u0010\u000b\u001a\u000e\u0012\u0004\u0012\u00020\r\u0012\u0004\u0012\u00020\u00050\f\u0012\u000e\b\u0003\u0010\u000e\u001a\b\u0012\u0004\u0012\u00020\u00100\u000f\u0012\u000e\b\u0003\u0010\u0011\u001a\b\u0012\u0004\u0012\u00020\u00120\u000f\u00a2\u0006\u0002\u0010\u0013J\u000b\u0010\"\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\t\u0010#\u001a\u00020\u0005H\u00c6\u0003J\t\u0010$\u001a\u00020\u0005H\u00c6\u0003J\t\u0010%\u001a\u00020\u0005H\u00c6\u0003J\t\u0010&\u001a\u00020\tH\u00c6\u0003J\t\u0010\'\u001a\u00020\tH\u00c6\u0003J\u0015\u0010(\u001a\u000e\u0012\u0004\u0012\u00020\r\u0012\u0004\u0012\u00020\u00050\fH\u00c6\u0003J\u000f\u0010)\u001a\b\u0012\u0004\u0012\u00020\u00100\u000fH\u00c6\u0003J\u000f\u0010*\u001a\b\u0012\u0004\u0012\u00020\u00120\u000fH\u00c6\u0003J}\u0010+\u001a\u00020\u00002\n\b\u0002\u0010\u0002\u001a\u0004\u0018\u00010\u00032\b\b\u0002\u0010\u0004\u001a\u00020\u00052\b\b\u0002\u0010\u0006\u001a\u00020\u00052\b\b\u0003\u0010\u0007\u001a\u00020\u00052\b\b\u0003\u0010\b\u001a\u00020\t2\b\b\u0003\u0010\n\u001a\u00020\t2\u0014\b\u0003\u0010\u000b\u001a\u000e\u0012\u0004\u0012\u00020\r\u0012\u0004\u0012\u00020\u00050\f2\u000e\b\u0003\u0010\u000e\u001a\b\u0012\u0004\u0012\u00020\u00100\u000f2\u000e\b\u0003\u0010\u0011\u001a\b\u0012\u0004\u0012\u00020\u00120\u000fH\u00c6\u0001J\u0013\u0010,\u001a\u00020-2\b\u0010.\u001a\u0004\u0018\u00010\u0001H\u00d6\u0003J\t\u0010/\u001a\u00020\tH\u00d6\u0001J\t\u00100\u001a\u00020\rH\u00d6\u0001R\u0013\u0010\u0002\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0014\u0010\u0015R\u0017\u0010\u000e\u001a\b\u0012\u0004\u0012\u00020\u00100\u000f\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0016\u0010\u0017R\u0011\u0010\u0006\u001a\u00020\u0005\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0018\u0010\u0019R\u001d\u0010\u000b\u001a\u000e\u0012\u0004\u0012\u00020\r\u0012\u0004\u0012\u00020\u00050\f\u00a2\u0006\b\n\u0000\u001a\u0004\b\u001a\u0010\u001bR\u0011\u0010\n\u001a\u00020\t\u00a2\u0006\b\n\u0000\u001a\u0004\b\u001c\u0010\u001dR\u0011\u0010\u0007\u001a\u00020\u0005\u00a2\u0006\b\n\u0000\u001a\u0004\b\u001e\u0010\u0019R\u0017\u0010\u0011\u001a\b\u0012\u0004\u0012\u00020\u00120\u000f\u00a2\u0006\b\n\u0000\u001a\u0004\b\u001f\u0010\u0017R\u0011\u0010\u0004\u001a\u00020\u0005\u00a2\u0006\b\n\u0000\u001a\u0004\b \u0010\u0019R\u0011\u0010\b\u001a\u00020\t\u00a2\u0006\b\n\u0000\u001a\u0004\b!\u0010\u001d\u00a8\u00061"}, d2 = {"Lcom/northend/admin/data/remote/models/DashboardBranchResponse;", "", "branch", "Lcom/northend/admin/data/remote/Branch;", "revenue", "", "expense", "pendingFees", "studentCount", "", "leadCount", "expenseByCategory", "", "", "counsellorPerformance", "", "Lcom/northend/admin/data/remote/models/CounsellorRow;", "recentPayments", "Lcom/northend/admin/data/remote/models/Payment;", "(Lcom/northend/admin/data/remote/Branch;DDDIILjava/util/Map;Ljava/util/List;Ljava/util/List;)V", "getBranch", "()Lcom/northend/admin/data/remote/Branch;", "getCounsellorPerformance", "()Ljava/util/List;", "getExpense", "()D", "getExpenseByCategory", "()Ljava/util/Map;", "getLeadCount", "()I", "getPendingFees", "getRecentPayments", "getRevenue", "getStudentCount", "component1", "component2", "component3", "component4", "component5", "component6", "component7", "component8", "component9", "copy", "equals", "", "other", "hashCode", "toString", "app_debug"})
public final class DashboardBranchResponse {
    @org.jetbrains.annotations.Nullable()
    private final com.northend.admin.data.remote.Branch branch = null;
    private final double revenue = 0.0;
    private final double expense = 0.0;
    private final double pendingFees = 0.0;
    private final int studentCount = 0;
    private final int leadCount = 0;
    @org.jetbrains.annotations.NotNull()
    private final java.util.Map<java.lang.String, java.lang.Double> expenseByCategory = null;
    @org.jetbrains.annotations.NotNull()
    private final java.util.List<com.northend.admin.data.remote.models.CounsellorRow> counsellorPerformance = null;
    @org.jetbrains.annotations.NotNull()
    private final java.util.List<com.northend.admin.data.remote.models.Payment> recentPayments = null;
    
    public DashboardBranchResponse(@org.jetbrains.annotations.Nullable()
    com.northend.admin.data.remote.Branch branch, double revenue, double expense, @com.squareup.moshi.Json(name = "pending_fees")
    double pendingFees, @com.squareup.moshi.Json(name = "student_count")
    int studentCount, @com.squareup.moshi.Json(name = "lead_count")
    int leadCount, @com.squareup.moshi.Json(name = "expense_by_category")
    @org.jetbrains.annotations.NotNull()
    java.util.Map<java.lang.String, java.lang.Double> expenseByCategory, @com.squareup.moshi.Json(name = "counsellor_performance")
    @org.jetbrains.annotations.NotNull()
    java.util.List<com.northend.admin.data.remote.models.CounsellorRow> counsellorPerformance, @com.squareup.moshi.Json(name = "recent_payments")
    @org.jetbrains.annotations.NotNull()
    java.util.List<com.northend.admin.data.remote.models.Payment> recentPayments) {
        super();
    }
    
    @org.jetbrains.annotations.Nullable()
    public final com.northend.admin.data.remote.Branch getBranch() {
        return null;
    }
    
    public final double getRevenue() {
        return 0.0;
    }
    
    public final double getExpense() {
        return 0.0;
    }
    
    public final double getPendingFees() {
        return 0.0;
    }
    
    public final int getStudentCount() {
        return 0;
    }
    
    public final int getLeadCount() {
        return 0;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.Map<java.lang.String, java.lang.Double> getExpenseByCategory() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<com.northend.admin.data.remote.models.CounsellorRow> getCounsellorPerformance() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<com.northend.admin.data.remote.models.Payment> getRecentPayments() {
        return null;
    }
    
    public DashboardBranchResponse() {
        super();
    }
    
    @org.jetbrains.annotations.Nullable()
    public final com.northend.admin.data.remote.Branch component1() {
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
    
    public final int component5() {
        return 0;
    }
    
    public final int component6() {
        return 0;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.Map<java.lang.String, java.lang.Double> component7() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<com.northend.admin.data.remote.models.CounsellorRow> component8() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<com.northend.admin.data.remote.models.Payment> component9() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.northend.admin.data.remote.models.DashboardBranchResponse copy(@org.jetbrains.annotations.Nullable()
    com.northend.admin.data.remote.Branch branch, double revenue, double expense, @com.squareup.moshi.Json(name = "pending_fees")
    double pendingFees, @com.squareup.moshi.Json(name = "student_count")
    int studentCount, @com.squareup.moshi.Json(name = "lead_count")
    int leadCount, @com.squareup.moshi.Json(name = "expense_by_category")
    @org.jetbrains.annotations.NotNull()
    java.util.Map<java.lang.String, java.lang.Double> expenseByCategory, @com.squareup.moshi.Json(name = "counsellor_performance")
    @org.jetbrains.annotations.NotNull()
    java.util.List<com.northend.admin.data.remote.models.CounsellorRow> counsellorPerformance, @com.squareup.moshi.Json(name = "recent_payments")
    @org.jetbrains.annotations.NotNull()
    java.util.List<com.northend.admin.data.remote.models.Payment> recentPayments) {
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