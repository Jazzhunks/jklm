package com.northend.admin.ui.erp;

import dagger.hilt.android.lifecycle.HiltViewModel;
import javax.inject.Inject;
import androidx.lifecycle.ViewModel;
import com.northend.admin.data.local.TokenManager;
import com.northend.admin.data.remote.AdminApiService;
import com.northend.admin.domain.model.User;
import kotlinx.coroutines.flow.StateFlow;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00000\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\u0002\n\u0000\b\u0007\u0018\u00002\u00020\u0001B\u0017\b\u0007\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u00a2\u0006\u0002\u0010\u0006J\u0006\u0010\u000e\u001a\u00020\u000fR\u0014\u0010\u0007\u001a\b\u0012\u0004\u0012\u00020\t0\bX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0017\u0010\n\u001a\b\u0012\u0004\u0012\u00020\t0\u000b\u00a2\u0006\b\n\u0000\u001a\u0004\b\f\u0010\r\u00a8\u0006\u0010"}, d2 = {"Lcom/northend/admin/ui/erp/StaffViewModel;", "Landroidx/lifecycle/ViewModel;", "apiService", "Lcom/northend/admin/data/remote/AdminApiService;", "tokenManager", "Lcom/northend/admin/data/local/TokenManager;", "(Lcom/northend/admin/data/remote/AdminApiService;Lcom/northend/admin/data/local/TokenManager;)V", "_uiState", "Lkotlinx/coroutines/flow/MutableStateFlow;", "Lcom/northend/admin/ui/erp/StaffUiState;", "uiState", "Lkotlinx/coroutines/flow/StateFlow;", "getUiState", "()Lkotlinx/coroutines/flow/StateFlow;", "load", "", "app_debug"})
@dagger.hilt.android.lifecycle.HiltViewModel()
public final class StaffViewModel extends androidx.lifecycle.ViewModel {
    @org.jetbrains.annotations.NotNull()
    private final com.northend.admin.data.remote.AdminApiService apiService = null;
    @org.jetbrains.annotations.NotNull()
    private final com.northend.admin.data.local.TokenManager tokenManager = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.MutableStateFlow<com.northend.admin.ui.erp.StaffUiState> _uiState = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.StateFlow<com.northend.admin.ui.erp.StaffUiState> uiState = null;
    
    @javax.inject.Inject()
    public StaffViewModel(@org.jetbrains.annotations.NotNull()
    com.northend.admin.data.remote.AdminApiService apiService, @org.jetbrains.annotations.NotNull()
    com.northend.admin.data.local.TokenManager tokenManager) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.StateFlow<com.northend.admin.ui.erp.StaffUiState> getUiState() {
        return null;
    }
    
    public final void load() {
    }
}