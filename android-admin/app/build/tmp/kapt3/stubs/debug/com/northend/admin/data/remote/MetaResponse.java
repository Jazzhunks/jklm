package com.northend.admin.data.remote;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000.\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010 \n\u0002\u0010\u000e\n\u0002\b\u0003\n\u0002\u0010\u0006\n\u0002\b\u0013\n\u0002\u0010\u000b\n\u0002\b\u0002\n\u0002\u0010\b\n\u0002\b\u0002\b\u0086\b\u0018\u00002\u00020\u0001BY\u0012\u000e\b\u0003\u0010\u0002\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003\u0012\u000e\b\u0003\u0010\u0005\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003\u0012\u000e\b\u0003\u0010\u0006\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003\u0012\b\b\u0003\u0010\u0007\u001a\u00020\b\u0012\b\b\u0003\u0010\t\u001a\u00020\b\u0012\u000e\b\u0002\u0010\n\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003\u00a2\u0006\u0002\u0010\u000bJ\u000f\u0010\u0014\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003H\u00c6\u0003J\u000f\u0010\u0015\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003H\u00c6\u0003J\u000f\u0010\u0016\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003H\u00c6\u0003J\t\u0010\u0017\u001a\u00020\bH\u00c6\u0003J\t\u0010\u0018\u001a\u00020\bH\u00c6\u0003J\u000f\u0010\u0019\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003H\u00c6\u0003J]\u0010\u001a\u001a\u00020\u00002\u000e\b\u0003\u0010\u0002\u001a\b\u0012\u0004\u0012\u00020\u00040\u00032\u000e\b\u0003\u0010\u0005\u001a\b\u0012\u0004\u0012\u00020\u00040\u00032\u000e\b\u0003\u0010\u0006\u001a\b\u0012\u0004\u0012\u00020\u00040\u00032\b\b\u0003\u0010\u0007\u001a\u00020\b2\b\b\u0003\u0010\t\u001a\u00020\b2\u000e\b\u0002\u0010\n\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003H\u00c6\u0001J\u0013\u0010\u001b\u001a\u00020\u001c2\b\u0010\u001d\u001a\u0004\u0018\u00010\u0001H\u00d6\u0003J\t\u0010\u001e\u001a\u00020\u001fH\u00d6\u0001J\t\u0010 \u001a\u00020\u0004H\u00d6\u0001R\u0011\u0010\u0007\u001a\u00020\b\u00a2\u0006\b\n\u0000\u001a\u0004\b\f\u0010\rR\u0017\u0010\u0002\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b\u000e\u0010\u000fR\u0017\u0010\u0006\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0010\u0010\u000fR\u0017\u0010\u0005\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0011\u0010\u000fR\u0017\u0010\n\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0012\u0010\u000fR\u0011\u0010\t\u001a\u00020\b\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0013\u0010\r\u00a8\u0006!"}, d2 = {"Lcom/northend/admin/data/remote/MetaResponse;", "", "expenseCategories", "", "", "paymentModes", "leadStatuses", "cgstRate", "", "sgstRate", "roles", "(Ljava/util/List;Ljava/util/List;Ljava/util/List;DDLjava/util/List;)V", "getCgstRate", "()D", "getExpenseCategories", "()Ljava/util/List;", "getLeadStatuses", "getPaymentModes", "getRoles", "getSgstRate", "component1", "component2", "component3", "component4", "component5", "component6", "copy", "equals", "", "other", "hashCode", "", "toString", "app_debug"})
public final class MetaResponse {
    @org.jetbrains.annotations.NotNull()
    private final java.util.List<java.lang.String> expenseCategories = null;
    @org.jetbrains.annotations.NotNull()
    private final java.util.List<java.lang.String> paymentModes = null;
    @org.jetbrains.annotations.NotNull()
    private final java.util.List<java.lang.String> leadStatuses = null;
    private final double cgstRate = 0.0;
    private final double sgstRate = 0.0;
    @org.jetbrains.annotations.NotNull()
    private final java.util.List<java.lang.String> roles = null;
    
    public MetaResponse(@com.squareup.moshi.Json(name = "expense_categories")
    @org.jetbrains.annotations.NotNull()
    java.util.List<java.lang.String> expenseCategories, @com.squareup.moshi.Json(name = "payment_modes")
    @org.jetbrains.annotations.NotNull()
    java.util.List<java.lang.String> paymentModes, @com.squareup.moshi.Json(name = "lead_statuses")
    @org.jetbrains.annotations.NotNull()
    java.util.List<java.lang.String> leadStatuses, @com.squareup.moshi.Json(name = "cgst_rate")
    double cgstRate, @com.squareup.moshi.Json(name = "sgst_rate")
    double sgstRate, @org.jetbrains.annotations.NotNull()
    java.util.List<java.lang.String> roles) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<java.lang.String> getExpenseCategories() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<java.lang.String> getPaymentModes() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<java.lang.String> getLeadStatuses() {
        return null;
    }
    
    public final double getCgstRate() {
        return 0.0;
    }
    
    public final double getSgstRate() {
        return 0.0;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<java.lang.String> getRoles() {
        return null;
    }
    
    public MetaResponse() {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<java.lang.String> component1() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<java.lang.String> component2() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<java.lang.String> component3() {
        return null;
    }
    
    public final double component4() {
        return 0.0;
    }
    
    public final double component5() {
        return 0.0;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<java.lang.String> component6() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.northend.admin.data.remote.MetaResponse copy(@com.squareup.moshi.Json(name = "expense_categories")
    @org.jetbrains.annotations.NotNull()
    java.util.List<java.lang.String> expenseCategories, @com.squareup.moshi.Json(name = "payment_modes")
    @org.jetbrains.annotations.NotNull()
    java.util.List<java.lang.String> paymentModes, @com.squareup.moshi.Json(name = "lead_statuses")
    @org.jetbrains.annotations.NotNull()
    java.util.List<java.lang.String> leadStatuses, @com.squareup.moshi.Json(name = "cgst_rate")
    double cgstRate, @com.squareup.moshi.Json(name = "sgst_rate")
    double sgstRate, @org.jetbrains.annotations.NotNull()
    java.util.List<java.lang.String> roles) {
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