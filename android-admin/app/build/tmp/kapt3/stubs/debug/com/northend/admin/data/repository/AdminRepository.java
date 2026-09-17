package com.northend.admin.data.repository;

@javax.inject.Singleton()
@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000\u00da\u0001\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0004\n\u0002\u0010\u000e\n\u0002\b\u0004\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010 \n\u0002\b\u0004\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0004\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0004\n\u0002\u0010\u0002\n\u0002\b\u0004\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0007\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\b\u0007\u0018\u00002\u00020\u0001B\u0017\b\u0007\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u00a2\u0006\u0002\u0010\u0006J \u0010\u0007\u001a\f\u0012\b\u0012\u00060\tj\u0002`\n0\b2\u0006\u0010\u000b\u001a\u00020\fH\u0086@\u00a2\u0006\u0002\u0010\rJ \u0010\u000e\u001a\f\u0012\b\u0012\u00060\u000fj\u0002`\u00100\b2\u0006\u0010\u0011\u001a\u00020\u0012H\u0086@\u00a2\u0006\u0002\u0010\u0013J \u0010\u0014\u001a\f\u0012\b\u0012\u00060\u0015j\u0002`\u00160\b2\u0006\u0010\u0017\u001a\u00020\u0018H\u0086@\u00a2\u0006\u0002\u0010\u0019J \u0010\u001a\u001a\f\u0012\b\u0012\u00060\u001bj\u0002`\u001c0\b2\u0006\u0010\u001d\u001a\u00020\u001bH\u0086@\u00a2\u0006\u0002\u0010\u001eJ4\u0010\u001f\u001a\f\u0012\b\u0012\u00060\tj\u0002`\n0\b2\u0006\u0010 \u001a\u00020!2\u0006\u0010\"\u001a\u00020!2\n\b\u0002\u0010#\u001a\u0004\u0018\u00010!H\u0086@\u00a2\u0006\u0002\u0010$J \u0010%\u001a\f\u0012\b\u0012\u00060&j\u0002`\'0\b2\u0006\u0010(\u001a\u00020!H\u0086@\u00a2\u0006\u0002\u0010)J6\u0010*\u001a\u0012\u0012\u000e\u0012\f\u0012\b\u0012\u00060\tj\u0002`\n0+0\b2\n\b\u0002\u0010(\u001a\u0004\u0018\u00010!2\n\b\u0002\u0010,\u001a\u0004\u0018\u00010!H\u0086@\u00a2\u0006\u0002\u0010-J6\u0010.\u001a\u0012\u0012\u000e\u0012\f\u0012\b\u0012\u00060\u000fj\u0002`\u00100+0\b2\n\b\u0002\u0010(\u001a\u0004\u0018\u00010!2\n\b\u0002\u0010,\u001a\u0004\u0018\u00010!H\u0086@\u00a2\u0006\u0002\u0010-J\u0018\u0010/\u001a\f\u0012\b\u0012\u000600j\u0002`10\bH\u0086@\u00a2\u0006\u0002\u00102J\u0014\u00103\u001a\b\u0012\u0004\u0012\u0002040\bH\u0086@\u00a2\u0006\u0002\u00102J6\u00105\u001a\u0012\u0012\u000e\u0012\f\u0012\b\u0012\u00060\u0015j\u0002`\u00160+0\b2\n\b\u0002\u0010(\u001a\u0004\u0018\u00010!2\n\b\u0002\u00106\u001a\u0004\u0018\u00010!H\u0086@\u00a2\u0006\u0002\u0010-J6\u00107\u001a\u0012\u0012\u000e\u0012\f\u0012\b\u0012\u00060\u001bj\u0002`\u001c0+0\b2\n\b\u0002\u0010(\u001a\u0004\u0018\u00010!2\n\b\u0002\u00106\u001a\u0004\u0018\u00010!H\u0086@\u00a2\u0006\u0002\u0010-J\u0018\u00108\u001a\f\u0012\b\u0012\u000609j\u0002`:0\bH\u0086@\u00a2\u0006\u0002\u00102J\"\u0010;\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020<0+0\b2\u0006\u0010=\u001a\u00020!H\u0086@\u00a2\u0006\u0002\u0010)J\u001a\u0010>\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020?0+0\bH\u0086@\u00a2\u0006\u0002\u00102J(\u0010@\u001a\f\u0012\b\u0012\u000600j\u0002`10\b2\u0006\u0010A\u001a\u00020!2\u0006\u0010B\u001a\u00020!H\u0086@\u00a2\u0006\u0002\u0010-J\u0014\u0010C\u001a\b\u0012\u0004\u0012\u00020D0\bH\u0086@\u00a2\u0006\u0002\u00102J\u0014\u0010E\u001a\b\u0012\u0004\u0012\u00020!0\bH\u0086@\u00a2\u0006\u0002\u00102J8\u0010F\u001a\b\u0012\u0004\u0012\u0002HG0\b\"\u0004\b\u0000\u0010G2\u001c\u0010H\u001a\u0018\b\u0001\u0012\n\u0012\b\u0012\u0004\u0012\u0002HG0J\u0012\u0006\u0012\u0004\u0018\u00010\u00010IH\u0082@\u00a2\u0006\u0002\u0010KJ>\u0010L\u001a\b\u0012\u0004\u0012\u0002HG0\b\"\u0004\b\u0000\u0010G2\"\u0010H\u001a\u001e\b\u0001\u0012\u0010\u0012\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u0002HG0M0J\u0012\u0006\u0012\u0004\u0018\u00010\u00010IH\u0082@\u00a2\u0006\u0002\u0010KJ&\u0010N\u001a\b\u0012\u0004\u0012\u00020O0\b2\u0006\u0010P\u001a\u00020!2\b\b\u0002\u0010Q\u001a\u00020!H\u0086@\u00a2\u0006\u0002\u0010-J$\u0010R\u001a\b\u0012\u0004\u0012\u00020<0\b2\u0006\u0010=\u001a\u00020!2\u0006\u0010S\u001a\u00020!H\u0086@\u00a2\u0006\u0002\u0010-J\u001c\u0010T\u001a\b\u0012\u0004\u0012\u00020\u00010\b2\u0006\u0010U\u001a\u00020!H\u0086@\u00a2\u0006\u0002\u0010)J(\u0010V\u001a\f\u0012\b\u0012\u00060\u000fj\u0002`\u00100\b2\u0006\u0010 \u001a\u00020!2\u0006\u0010\u0011\u001a\u00020WH\u0086@\u00a2\u0006\u0002\u0010XJ.\u0010Y\u001a\b\u0012\u0004\u0012\u00020Z0\b2\u0006\u0010P\u001a\u00020!2\u0006\u0010[\u001a\u00020!2\b\b\u0002\u0010Q\u001a\u00020!H\u0086@\u00a2\u0006\u0002\u0010$R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\\"}, d2 = {"Lcom/northend/admin/data/repository/AdminRepository;", "", "apiService", "Lcom/northend/admin/data/remote/AdminApiService;", "tokenManager", "Lcom/northend/admin/data/local/TokenManager;", "(Lcom/northend/admin/data/remote/AdminApiService;Lcom/northend/admin/data/local/TokenManager;)V", "createExpense", "Lcom/northend/admin/utils/ResultWrapper;", "Lcom/northend/admin/data/remote/models/Expense;", "Lcom/northend/admin/domain/model/Expense;", "expense", "Lcom/northend/admin/data/remote/models/ExpenseCreateRequest;", "(Lcom/northend/admin/data/remote/models/ExpenseCreateRequest;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "createLead", "Lcom/northend/admin/data/remote/models/Lead;", "Lcom/northend/admin/domain/model/Lead;", "lead", "Lcom/northend/admin/data/remote/models/LeadCreateRequest;", "(Lcom/northend/admin/data/remote/models/LeadCreateRequest;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "createPayment", "Lcom/northend/admin/data/remote/models/Payment;", "Lcom/northend/admin/domain/model/Payment;", "payment", "Lcom/northend/admin/data/remote/models/PaymentCreateRequest;", "(Lcom/northend/admin/data/remote/models/PaymentCreateRequest;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "createStudent", "Lcom/northend/admin/data/remote/models/Student;", "Lcom/northend/admin/domain/model/Student;", "student", "(Lcom/northend/admin/data/remote/models/Student;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "decideExpense", "id", "", "decision", "note", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getBranchDashboard", "Lcom/northend/admin/data/remote/models/DashboardBranchResponse;", "Lcom/northend/admin/domain/model/DashboardBranchResponse;", "branchId", "(Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getExpenses", "", "status", "(Ljava/lang/String;Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getLeads", "getMe", "Lcom/northend/admin/data/remote/User;", "Lcom/northend/admin/domain/model/User;", "(Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getMeta", "Lcom/northend/admin/data/remote/MetaResponse;", "getPayments", "query", "getStudents", "getSuperDashboard", "Lcom/northend/admin/data/remote/models/DashboardSuperResponse;", "Lcom/northend/admin/domain/model/DashboardSuperResponse;", "getWhatsAppMessages", "Lcom/northend/admin/data/remote/models/WhatsAppMessage;", "threadId", "listWhatsAppThreads", "Lcom/northend/admin/data/remote/models/WhatsAppThread;", "login", "email", "password", "logout", "", "refreshToken", "safeApiCall", "T", "apiCall", "Lkotlin/Function1;", "Lkotlin/coroutines/Continuation;", "(Lkotlin/jvm/functions/Function1;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "safeResponseCall", "Lretrofit2/Response;", "sendOtp", "Lcom/northend/admin/data/remote/SendOtpResponse;", "identifier", "action", "sendWhatsAppMessage", "text", "updateFcmToken", "token", "updateLead", "Lcom/northend/admin/data/remote/models/LeadUpdateRequest;", "(Ljava/lang/String;Lcom/northend/admin/data/remote/models/LeadUpdateRequest;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "verifyOtp", "Lcom/northend/admin/data/remote/LoginResponse;", "code", "app_debug"})
public final class AdminRepository {
    @org.jetbrains.annotations.NotNull()
    private final com.northend.admin.data.remote.AdminApiService apiService = null;
    @org.jetbrains.annotations.NotNull()
    private final com.northend.admin.data.local.TokenManager tokenManager = null;
    
    @javax.inject.Inject()
    public AdminRepository(@org.jetbrains.annotations.NotNull()
    com.northend.admin.data.remote.AdminApiService apiService, @org.jetbrains.annotations.NotNull()
    com.northend.admin.data.local.TokenManager tokenManager) {
        super();
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object updateFcmToken(@org.jetbrains.annotations.NotNull()
    java.lang.String token, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<? extends java.lang.Object>> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object login(@org.jetbrains.annotations.NotNull()
    java.lang.String email, @org.jetbrains.annotations.NotNull()
    java.lang.String password, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<com.northend.admin.data.remote.User>> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object refreshToken(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<java.lang.String>> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object sendOtp(@org.jetbrains.annotations.NotNull()
    java.lang.String identifier, @org.jetbrains.annotations.NotNull()
    java.lang.String action, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<com.northend.admin.data.remote.SendOtpResponse>> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object verifyOtp(@org.jetbrains.annotations.NotNull()
    java.lang.String identifier, @org.jetbrains.annotations.NotNull()
    java.lang.String code, @org.jetbrains.annotations.NotNull()
    java.lang.String action, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<com.northend.admin.data.remote.LoginResponse>> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object getMe(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<com.northend.admin.data.remote.User>> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object getStudents(@org.jetbrains.annotations.Nullable()
    java.lang.String branchId, @org.jetbrains.annotations.Nullable()
    java.lang.String query, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<? extends java.util.List<com.northend.admin.data.remote.models.Student>>> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object createStudent(@org.jetbrains.annotations.NotNull()
    com.northend.admin.data.remote.models.Student student, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<com.northend.admin.data.remote.models.Student>> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object getPayments(@org.jetbrains.annotations.Nullable()
    java.lang.String branchId, @org.jetbrains.annotations.Nullable()
    java.lang.String query, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<? extends java.util.List<com.northend.admin.data.remote.models.Payment>>> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object createPayment(@org.jetbrains.annotations.NotNull()
    com.northend.admin.data.remote.models.PaymentCreateRequest payment, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<com.northend.admin.data.remote.models.Payment>> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object getExpenses(@org.jetbrains.annotations.Nullable()
    java.lang.String branchId, @org.jetbrains.annotations.Nullable()
    java.lang.String status, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<? extends java.util.List<com.northend.admin.data.remote.models.Expense>>> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object createExpense(@org.jetbrains.annotations.NotNull()
    com.northend.admin.data.remote.models.ExpenseCreateRequest expense, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<com.northend.admin.data.remote.models.Expense>> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object decideExpense(@org.jetbrains.annotations.NotNull()
    java.lang.String id, @org.jetbrains.annotations.NotNull()
    java.lang.String decision, @org.jetbrains.annotations.Nullable()
    java.lang.String note, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<com.northend.admin.data.remote.models.Expense>> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object getLeads(@org.jetbrains.annotations.Nullable()
    java.lang.String branchId, @org.jetbrains.annotations.Nullable()
    java.lang.String status, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<? extends java.util.List<com.northend.admin.data.remote.models.Lead>>> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object createLead(@org.jetbrains.annotations.NotNull()
    com.northend.admin.data.remote.models.LeadCreateRequest lead, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<com.northend.admin.data.remote.models.Lead>> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object updateLead(@org.jetbrains.annotations.NotNull()
    java.lang.String id, @org.jetbrains.annotations.NotNull()
    com.northend.admin.data.remote.models.LeadUpdateRequest lead, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<com.northend.admin.data.remote.models.Lead>> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object getSuperDashboard(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<com.northend.admin.data.remote.models.DashboardSuperResponse>> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object getBranchDashboard(@org.jetbrains.annotations.NotNull()
    java.lang.String branchId, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<com.northend.admin.data.remote.models.DashboardBranchResponse>> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object listWhatsAppThreads(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<? extends java.util.List<com.northend.admin.data.remote.models.WhatsAppThread>>> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object getWhatsAppMessages(@org.jetbrains.annotations.NotNull()
    java.lang.String threadId, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<? extends java.util.List<com.northend.admin.data.remote.models.WhatsAppMessage>>> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object sendWhatsAppMessage(@org.jetbrains.annotations.NotNull()
    java.lang.String threadId, @org.jetbrains.annotations.NotNull()
    java.lang.String text, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<com.northend.admin.data.remote.models.WhatsAppMessage>> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object getMeta(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<com.northend.admin.data.remote.MetaResponse>> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object logout(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<kotlin.Unit>> $completion) {
        return null;
    }
    
    private final <T extends java.lang.Object>java.lang.Object safeResponseCall(kotlin.jvm.functions.Function1<? super kotlin.coroutines.Continuation<? super retrofit2.Response<T>>, ? extends java.lang.Object> apiCall, kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<? extends T>> $completion) {
        return null;
    }
    
    private final <T extends java.lang.Object>java.lang.Object safeApiCall(kotlin.jvm.functions.Function1<? super kotlin.coroutines.Continuation<? super T>, ? extends java.lang.Object> apiCall, kotlin.coroutines.Continuation<? super com.northend.admin.utils.ResultWrapper<? extends T>> $completion) {
        return null;
    }
}