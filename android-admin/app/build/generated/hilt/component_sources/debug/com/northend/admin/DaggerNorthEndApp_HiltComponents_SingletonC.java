package com.northend.admin;

import android.app.Activity;
import android.app.Service;
import android.view.View;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.SavedStateHandle;
import androidx.lifecycle.ViewModel;
import com.northend.admin.data.local.TokenManager;
import com.northend.admin.data.local.room.WhatsAppDao;
import com.northend.admin.data.local.room.WhatsAppDatabase;
import com.northend.admin.data.remote.AdminApiService;
import com.northend.admin.data.repository.AdminRepository;
import com.northend.admin.di.DatabaseModule;
import com.northend.admin.di.DatabaseModule_ProvideWhatsAppDaoFactory;
import com.northend.admin.di.DatabaseModule_ProvideWhatsAppDatabaseFactory;
import com.northend.admin.di.NetworkModule;
import com.northend.admin.di.NetworkModule_ProvideAdminApiServiceFactory;
import com.northend.admin.di.NetworkModule_ProvideAdminRepositoryFactory;
import com.northend.admin.di.NetworkModule_ProvideMoshiFactory;
import com.northend.admin.di.NetworkModule_ProvideOkHttpClientFactory;
import com.northend.admin.di.NetworkModule_ProvideRetrofitFactory;
import com.northend.admin.di.NetworkModule_ProvideTokenManagerFactory;
import com.northend.admin.ui.MainActivity;
import com.northend.admin.ui.auth.LoginViewModel;
import com.northend.admin.ui.auth.LoginViewModel_HiltModules_KeyModule_ProvideFactory;
import com.northend.admin.ui.erp.AttendanceViewModel;
import com.northend.admin.ui.erp.AttendanceViewModel_HiltModules_KeyModule_ProvideFactory;
import com.northend.admin.ui.erp.AuditViewModel;
import com.northend.admin.ui.erp.AuditViewModel_HiltModules_KeyModule_ProvideFactory;
import com.northend.admin.ui.erp.BranchesViewModel;
import com.northend.admin.ui.erp.BranchesViewModel_HiltModules_KeyModule_ProvideFactory;
import com.northend.admin.ui.erp.DashboardViewModel;
import com.northend.admin.ui.erp.DashboardViewModel_HiltModules_KeyModule_ProvideFactory;
import com.northend.admin.ui.erp.ExpensesViewModel;
import com.northend.admin.ui.erp.ExpensesViewModel_HiltModules_KeyModule_ProvideFactory;
import com.northend.admin.ui.erp.IdCardsViewModel;
import com.northend.admin.ui.erp.IdCardsViewModel_HiltModules_KeyModule_ProvideFactory;
import com.northend.admin.ui.erp.LeadsViewModel;
import com.northend.admin.ui.erp.LeadsViewModel_HiltModules_KeyModule_ProvideFactory;
import com.northend.admin.ui.erp.PaymentsViewModel;
import com.northend.admin.ui.erp.PaymentsViewModel_HiltModules_KeyModule_ProvideFactory;
import com.northend.admin.ui.erp.StaffViewModel;
import com.northend.admin.ui.erp.StaffViewModel_HiltModules_KeyModule_ProvideFactory;
import com.northend.admin.ui.erp.StudentsViewModel;
import com.northend.admin.ui.erp.StudentsViewModel_HiltModules_KeyModule_ProvideFactory;
import com.northend.admin.ui.erp.WhatsAppViewModel;
import com.northend.admin.ui.erp.WhatsAppViewModel_HiltModules_KeyModule_ProvideFactory;
import com.squareup.moshi.Moshi;
import dagger.hilt.android.ActivityRetainedLifecycle;
import dagger.hilt.android.ViewModelLifecycle;
import dagger.hilt.android.flags.HiltWrapper_FragmentGetContextFix_FragmentGetContextFixModule;
import dagger.hilt.android.internal.builders.ActivityComponentBuilder;
import dagger.hilt.android.internal.builders.ActivityRetainedComponentBuilder;
import dagger.hilt.android.internal.builders.FragmentComponentBuilder;
import dagger.hilt.android.internal.builders.ServiceComponentBuilder;
import dagger.hilt.android.internal.builders.ViewComponentBuilder;
import dagger.hilt.android.internal.builders.ViewModelComponentBuilder;
import dagger.hilt.android.internal.builders.ViewWithFragmentComponentBuilder;
import dagger.hilt.android.internal.lifecycle.DefaultViewModelFactories;
import dagger.hilt.android.internal.lifecycle.DefaultViewModelFactories_InternalFactoryFactory_Factory;
import dagger.hilt.android.internal.managers.ActivityRetainedComponentManager_LifecycleModule_ProvideActivityRetainedLifecycleFactory;
import dagger.hilt.android.internal.modules.ApplicationContextModule;
import dagger.hilt.android.internal.modules.ApplicationContextModule_ProvideContextFactory;
import dagger.internal.DaggerGenerated;
import dagger.internal.DelegateFactory;
import dagger.internal.DoubleCheck;
import dagger.internal.MapBuilder;
import dagger.internal.Preconditions;
import dagger.internal.SetBuilder;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import javax.annotation.processing.Generated;
import javax.inject.Provider;
import okhttp3.OkHttpClient;
import retrofit2.Retrofit;

@DaggerGenerated
@Generated(
    value = "dagger.internal.codegen.ComponentProcessor",
    comments = "https://dagger.dev"
)
@SuppressWarnings({
    "unchecked",
    "rawtypes",
    "KotlinInternal",
    "KotlinInternalInJava"
})
public final class DaggerNorthEndApp_HiltComponents_SingletonC {
  private DaggerNorthEndApp_HiltComponents_SingletonC() {
  }

  public static Builder builder() {
    return new Builder();
  }

  public static final class Builder {
    private ApplicationContextModule applicationContextModule;

    private Builder() {
    }

    public Builder applicationContextModule(ApplicationContextModule applicationContextModule) {
      this.applicationContextModule = Preconditions.checkNotNull(applicationContextModule);
      return this;
    }

    /**
     * @deprecated This module is declared, but an instance is not used in the component. This method is a no-op. For more, see https://dagger.dev/unused-modules.
     */
    @Deprecated
    public Builder databaseModule(DatabaseModule databaseModule) {
      Preconditions.checkNotNull(databaseModule);
      return this;
    }

    /**
     * @deprecated This module is declared, but an instance is not used in the component. This method is a no-op. For more, see https://dagger.dev/unused-modules.
     */
    @Deprecated
    public Builder hiltWrapper_FragmentGetContextFix_FragmentGetContextFixModule(
        HiltWrapper_FragmentGetContextFix_FragmentGetContextFixModule hiltWrapper_FragmentGetContextFix_FragmentGetContextFixModule) {
      Preconditions.checkNotNull(hiltWrapper_FragmentGetContextFix_FragmentGetContextFixModule);
      return this;
    }

    /**
     * @deprecated This module is declared, but an instance is not used in the component. This method is a no-op. For more, see https://dagger.dev/unused-modules.
     */
    @Deprecated
    public Builder networkModule(NetworkModule networkModule) {
      Preconditions.checkNotNull(networkModule);
      return this;
    }

    public NorthEndApp_HiltComponents.SingletonC build() {
      Preconditions.checkBuilderRequirement(applicationContextModule, ApplicationContextModule.class);
      return new SingletonCImpl(applicationContextModule);
    }
  }

  private static final class ActivityRetainedCBuilder implements NorthEndApp_HiltComponents.ActivityRetainedC.Builder {
    private final SingletonCImpl singletonCImpl;

    private ActivityRetainedCBuilder(SingletonCImpl singletonCImpl) {
      this.singletonCImpl = singletonCImpl;
    }

    @Override
    public NorthEndApp_HiltComponents.ActivityRetainedC build() {
      return new ActivityRetainedCImpl(singletonCImpl);
    }
  }

  private static final class ActivityCBuilder implements NorthEndApp_HiltComponents.ActivityC.Builder {
    private final SingletonCImpl singletonCImpl;

    private final ActivityRetainedCImpl activityRetainedCImpl;

    private Activity activity;

    private ActivityCBuilder(SingletonCImpl singletonCImpl,
        ActivityRetainedCImpl activityRetainedCImpl) {
      this.singletonCImpl = singletonCImpl;
      this.activityRetainedCImpl = activityRetainedCImpl;
    }

    @Override
    public ActivityCBuilder activity(Activity activity) {
      this.activity = Preconditions.checkNotNull(activity);
      return this;
    }

    @Override
    public NorthEndApp_HiltComponents.ActivityC build() {
      Preconditions.checkBuilderRequirement(activity, Activity.class);
      return new ActivityCImpl(singletonCImpl, activityRetainedCImpl, activity);
    }
  }

  private static final class FragmentCBuilder implements NorthEndApp_HiltComponents.FragmentC.Builder {
    private final SingletonCImpl singletonCImpl;

    private final ActivityRetainedCImpl activityRetainedCImpl;

    private final ActivityCImpl activityCImpl;

    private Fragment fragment;

    private FragmentCBuilder(SingletonCImpl singletonCImpl,
        ActivityRetainedCImpl activityRetainedCImpl, ActivityCImpl activityCImpl) {
      this.singletonCImpl = singletonCImpl;
      this.activityRetainedCImpl = activityRetainedCImpl;
      this.activityCImpl = activityCImpl;
    }

    @Override
    public FragmentCBuilder fragment(Fragment fragment) {
      this.fragment = Preconditions.checkNotNull(fragment);
      return this;
    }

    @Override
    public NorthEndApp_HiltComponents.FragmentC build() {
      Preconditions.checkBuilderRequirement(fragment, Fragment.class);
      return new FragmentCImpl(singletonCImpl, activityRetainedCImpl, activityCImpl, fragment);
    }
  }

  private static final class ViewWithFragmentCBuilder implements NorthEndApp_HiltComponents.ViewWithFragmentC.Builder {
    private final SingletonCImpl singletonCImpl;

    private final ActivityRetainedCImpl activityRetainedCImpl;

    private final ActivityCImpl activityCImpl;

    private final FragmentCImpl fragmentCImpl;

    private View view;

    private ViewWithFragmentCBuilder(SingletonCImpl singletonCImpl,
        ActivityRetainedCImpl activityRetainedCImpl, ActivityCImpl activityCImpl,
        FragmentCImpl fragmentCImpl) {
      this.singletonCImpl = singletonCImpl;
      this.activityRetainedCImpl = activityRetainedCImpl;
      this.activityCImpl = activityCImpl;
      this.fragmentCImpl = fragmentCImpl;
    }

    @Override
    public ViewWithFragmentCBuilder view(View view) {
      this.view = Preconditions.checkNotNull(view);
      return this;
    }

    @Override
    public NorthEndApp_HiltComponents.ViewWithFragmentC build() {
      Preconditions.checkBuilderRequirement(view, View.class);
      return new ViewWithFragmentCImpl(singletonCImpl, activityRetainedCImpl, activityCImpl, fragmentCImpl, view);
    }
  }

  private static final class ViewCBuilder implements NorthEndApp_HiltComponents.ViewC.Builder {
    private final SingletonCImpl singletonCImpl;

    private final ActivityRetainedCImpl activityRetainedCImpl;

    private final ActivityCImpl activityCImpl;

    private View view;

    private ViewCBuilder(SingletonCImpl singletonCImpl, ActivityRetainedCImpl activityRetainedCImpl,
        ActivityCImpl activityCImpl) {
      this.singletonCImpl = singletonCImpl;
      this.activityRetainedCImpl = activityRetainedCImpl;
      this.activityCImpl = activityCImpl;
    }

    @Override
    public ViewCBuilder view(View view) {
      this.view = Preconditions.checkNotNull(view);
      return this;
    }

    @Override
    public NorthEndApp_HiltComponents.ViewC build() {
      Preconditions.checkBuilderRequirement(view, View.class);
      return new ViewCImpl(singletonCImpl, activityRetainedCImpl, activityCImpl, view);
    }
  }

  private static final class ViewModelCBuilder implements NorthEndApp_HiltComponents.ViewModelC.Builder {
    private final SingletonCImpl singletonCImpl;

    private final ActivityRetainedCImpl activityRetainedCImpl;

    private SavedStateHandle savedStateHandle;

    private ViewModelLifecycle viewModelLifecycle;

    private ViewModelCBuilder(SingletonCImpl singletonCImpl,
        ActivityRetainedCImpl activityRetainedCImpl) {
      this.singletonCImpl = singletonCImpl;
      this.activityRetainedCImpl = activityRetainedCImpl;
    }

    @Override
    public ViewModelCBuilder savedStateHandle(SavedStateHandle handle) {
      this.savedStateHandle = Preconditions.checkNotNull(handle);
      return this;
    }

    @Override
    public ViewModelCBuilder viewModelLifecycle(ViewModelLifecycle viewModelLifecycle) {
      this.viewModelLifecycle = Preconditions.checkNotNull(viewModelLifecycle);
      return this;
    }

    @Override
    public NorthEndApp_HiltComponents.ViewModelC build() {
      Preconditions.checkBuilderRequirement(savedStateHandle, SavedStateHandle.class);
      Preconditions.checkBuilderRequirement(viewModelLifecycle, ViewModelLifecycle.class);
      return new ViewModelCImpl(singletonCImpl, activityRetainedCImpl, savedStateHandle, viewModelLifecycle);
    }
  }

  private static final class ServiceCBuilder implements NorthEndApp_HiltComponents.ServiceC.Builder {
    private final SingletonCImpl singletonCImpl;

    private Service service;

    private ServiceCBuilder(SingletonCImpl singletonCImpl) {
      this.singletonCImpl = singletonCImpl;
    }

    @Override
    public ServiceCBuilder service(Service service) {
      this.service = Preconditions.checkNotNull(service);
      return this;
    }

    @Override
    public NorthEndApp_HiltComponents.ServiceC build() {
      Preconditions.checkBuilderRequirement(service, Service.class);
      return new ServiceCImpl(singletonCImpl, service);
    }
  }

  private static final class ViewWithFragmentCImpl extends NorthEndApp_HiltComponents.ViewWithFragmentC {
    private final SingletonCImpl singletonCImpl;

    private final ActivityRetainedCImpl activityRetainedCImpl;

    private final ActivityCImpl activityCImpl;

    private final FragmentCImpl fragmentCImpl;

    private final ViewWithFragmentCImpl viewWithFragmentCImpl = this;

    private ViewWithFragmentCImpl(SingletonCImpl singletonCImpl,
        ActivityRetainedCImpl activityRetainedCImpl, ActivityCImpl activityCImpl,
        FragmentCImpl fragmentCImpl, View viewParam) {
      this.singletonCImpl = singletonCImpl;
      this.activityRetainedCImpl = activityRetainedCImpl;
      this.activityCImpl = activityCImpl;
      this.fragmentCImpl = fragmentCImpl;


    }
  }

  private static final class FragmentCImpl extends NorthEndApp_HiltComponents.FragmentC {
    private final SingletonCImpl singletonCImpl;

    private final ActivityRetainedCImpl activityRetainedCImpl;

    private final ActivityCImpl activityCImpl;

    private final FragmentCImpl fragmentCImpl = this;

    private FragmentCImpl(SingletonCImpl singletonCImpl,
        ActivityRetainedCImpl activityRetainedCImpl, ActivityCImpl activityCImpl,
        Fragment fragmentParam) {
      this.singletonCImpl = singletonCImpl;
      this.activityRetainedCImpl = activityRetainedCImpl;
      this.activityCImpl = activityCImpl;


    }

    @Override
    public DefaultViewModelFactories.InternalFactoryFactory getHiltInternalFactoryFactory() {
      return activityCImpl.getHiltInternalFactoryFactory();
    }

    @Override
    public ViewWithFragmentComponentBuilder viewWithFragmentComponentBuilder() {
      return new ViewWithFragmentCBuilder(singletonCImpl, activityRetainedCImpl, activityCImpl, fragmentCImpl);
    }
  }

  private static final class ViewCImpl extends NorthEndApp_HiltComponents.ViewC {
    private final SingletonCImpl singletonCImpl;

    private final ActivityRetainedCImpl activityRetainedCImpl;

    private final ActivityCImpl activityCImpl;

    private final ViewCImpl viewCImpl = this;

    private ViewCImpl(SingletonCImpl singletonCImpl, ActivityRetainedCImpl activityRetainedCImpl,
        ActivityCImpl activityCImpl, View viewParam) {
      this.singletonCImpl = singletonCImpl;
      this.activityRetainedCImpl = activityRetainedCImpl;
      this.activityCImpl = activityCImpl;


    }
  }

  private static final class ActivityCImpl extends NorthEndApp_HiltComponents.ActivityC {
    private final SingletonCImpl singletonCImpl;

    private final ActivityRetainedCImpl activityRetainedCImpl;

    private final ActivityCImpl activityCImpl = this;

    private ActivityCImpl(SingletonCImpl singletonCImpl,
        ActivityRetainedCImpl activityRetainedCImpl, Activity activityParam) {
      this.singletonCImpl = singletonCImpl;
      this.activityRetainedCImpl = activityRetainedCImpl;


    }

    @Override
    public void injectMainActivity(MainActivity mainActivity) {
    }

    @Override
    public DefaultViewModelFactories.InternalFactoryFactory getHiltInternalFactoryFactory() {
      return DefaultViewModelFactories_InternalFactoryFactory_Factory.newInstance(getViewModelKeys(), new ViewModelCBuilder(singletonCImpl, activityRetainedCImpl));
    }

    @Override
    public Set<String> getViewModelKeys() {
      return SetBuilder.<String>newSetBuilder(12).add(AttendanceViewModel_HiltModules_KeyModule_ProvideFactory.provide()).add(AuditViewModel_HiltModules_KeyModule_ProvideFactory.provide()).add(BranchesViewModel_HiltModules_KeyModule_ProvideFactory.provide()).add(DashboardViewModel_HiltModules_KeyModule_ProvideFactory.provide()).add(ExpensesViewModel_HiltModules_KeyModule_ProvideFactory.provide()).add(IdCardsViewModel_HiltModules_KeyModule_ProvideFactory.provide()).add(LeadsViewModel_HiltModules_KeyModule_ProvideFactory.provide()).add(LoginViewModel_HiltModules_KeyModule_ProvideFactory.provide()).add(PaymentsViewModel_HiltModules_KeyModule_ProvideFactory.provide()).add(StaffViewModel_HiltModules_KeyModule_ProvideFactory.provide()).add(StudentsViewModel_HiltModules_KeyModule_ProvideFactory.provide()).add(WhatsAppViewModel_HiltModules_KeyModule_ProvideFactory.provide()).build();
    }

    @Override
    public ViewModelComponentBuilder getViewModelComponentBuilder() {
      return new ViewModelCBuilder(singletonCImpl, activityRetainedCImpl);
    }

    @Override
    public FragmentComponentBuilder fragmentComponentBuilder() {
      return new FragmentCBuilder(singletonCImpl, activityRetainedCImpl, activityCImpl);
    }

    @Override
    public ViewComponentBuilder viewComponentBuilder() {
      return new ViewCBuilder(singletonCImpl, activityRetainedCImpl, activityCImpl);
    }
  }

  private static final class ViewModelCImpl extends NorthEndApp_HiltComponents.ViewModelC {
    private final SingletonCImpl singletonCImpl;

    private final ActivityRetainedCImpl activityRetainedCImpl;

    private final ViewModelCImpl viewModelCImpl = this;

    private Provider<AttendanceViewModel> attendanceViewModelProvider;

    private Provider<AuditViewModel> auditViewModelProvider;

    private Provider<BranchesViewModel> branchesViewModelProvider;

    private Provider<DashboardViewModel> dashboardViewModelProvider;

    private Provider<ExpensesViewModel> expensesViewModelProvider;

    private Provider<IdCardsViewModel> idCardsViewModelProvider;

    private Provider<LeadsViewModel> leadsViewModelProvider;

    private Provider<LoginViewModel> loginViewModelProvider;

    private Provider<PaymentsViewModel> paymentsViewModelProvider;

    private Provider<StaffViewModel> staffViewModelProvider;

    private Provider<StudentsViewModel> studentsViewModelProvider;

    private Provider<WhatsAppViewModel> whatsAppViewModelProvider;

    private ViewModelCImpl(SingletonCImpl singletonCImpl,
        ActivityRetainedCImpl activityRetainedCImpl, SavedStateHandle savedStateHandleParam,
        ViewModelLifecycle viewModelLifecycleParam) {
      this.singletonCImpl = singletonCImpl;
      this.activityRetainedCImpl = activityRetainedCImpl;

      initialize(savedStateHandleParam, viewModelLifecycleParam);

    }

    @SuppressWarnings("unchecked")
    private void initialize(final SavedStateHandle savedStateHandleParam,
        final ViewModelLifecycle viewModelLifecycleParam) {
      this.attendanceViewModelProvider = new SwitchingProvider<>(singletonCImpl, activityRetainedCImpl, viewModelCImpl, 0);
      this.auditViewModelProvider = new SwitchingProvider<>(singletonCImpl, activityRetainedCImpl, viewModelCImpl, 1);
      this.branchesViewModelProvider = new SwitchingProvider<>(singletonCImpl, activityRetainedCImpl, viewModelCImpl, 2);
      this.dashboardViewModelProvider = new SwitchingProvider<>(singletonCImpl, activityRetainedCImpl, viewModelCImpl, 3);
      this.expensesViewModelProvider = new SwitchingProvider<>(singletonCImpl, activityRetainedCImpl, viewModelCImpl, 4);
      this.idCardsViewModelProvider = new SwitchingProvider<>(singletonCImpl, activityRetainedCImpl, viewModelCImpl, 5);
      this.leadsViewModelProvider = new SwitchingProvider<>(singletonCImpl, activityRetainedCImpl, viewModelCImpl, 6);
      this.loginViewModelProvider = new SwitchingProvider<>(singletonCImpl, activityRetainedCImpl, viewModelCImpl, 7);
      this.paymentsViewModelProvider = new SwitchingProvider<>(singletonCImpl, activityRetainedCImpl, viewModelCImpl, 8);
      this.staffViewModelProvider = new SwitchingProvider<>(singletonCImpl, activityRetainedCImpl, viewModelCImpl, 9);
      this.studentsViewModelProvider = new SwitchingProvider<>(singletonCImpl, activityRetainedCImpl, viewModelCImpl, 10);
      this.whatsAppViewModelProvider = new SwitchingProvider<>(singletonCImpl, activityRetainedCImpl, viewModelCImpl, 11);
    }

    @Override
    public Map<String, Provider<ViewModel>> getHiltViewModelMap() {
      return MapBuilder.<String, Provider<ViewModel>>newMapBuilder(12).put("com.northend.admin.ui.erp.AttendanceViewModel", ((Provider) attendanceViewModelProvider)).put("com.northend.admin.ui.erp.AuditViewModel", ((Provider) auditViewModelProvider)).put("com.northend.admin.ui.erp.BranchesViewModel", ((Provider) branchesViewModelProvider)).put("com.northend.admin.ui.erp.DashboardViewModel", ((Provider) dashboardViewModelProvider)).put("com.northend.admin.ui.erp.ExpensesViewModel", ((Provider) expensesViewModelProvider)).put("com.northend.admin.ui.erp.IdCardsViewModel", ((Provider) idCardsViewModelProvider)).put("com.northend.admin.ui.erp.LeadsViewModel", ((Provider) leadsViewModelProvider)).put("com.northend.admin.ui.auth.LoginViewModel", ((Provider) loginViewModelProvider)).put("com.northend.admin.ui.erp.PaymentsViewModel", ((Provider) paymentsViewModelProvider)).put("com.northend.admin.ui.erp.StaffViewModel", ((Provider) staffViewModelProvider)).put("com.northend.admin.ui.erp.StudentsViewModel", ((Provider) studentsViewModelProvider)).put("com.northend.admin.ui.erp.WhatsAppViewModel", ((Provider) whatsAppViewModelProvider)).build();
    }

    private static final class SwitchingProvider<T> implements Provider<T> {
      private final SingletonCImpl singletonCImpl;

      private final ActivityRetainedCImpl activityRetainedCImpl;

      private final ViewModelCImpl viewModelCImpl;

      private final int id;

      SwitchingProvider(SingletonCImpl singletonCImpl, ActivityRetainedCImpl activityRetainedCImpl,
          ViewModelCImpl viewModelCImpl, int id) {
        this.singletonCImpl = singletonCImpl;
        this.activityRetainedCImpl = activityRetainedCImpl;
        this.viewModelCImpl = viewModelCImpl;
        this.id = id;
      }

      @SuppressWarnings("unchecked")
      @Override
      public T get() {
        switch (id) {
          case 0: // com.northend.admin.ui.erp.AttendanceViewModel 
          return (T) new AttendanceViewModel(singletonCImpl.provideAdminApiServiceProvider.get(), singletonCImpl.provideTokenManagerProvider.get());

          case 1: // com.northend.admin.ui.erp.AuditViewModel 
          return (T) new AuditViewModel(singletonCImpl.provideAdminApiServiceProvider.get(), singletonCImpl.provideTokenManagerProvider.get());

          case 2: // com.northend.admin.ui.erp.BranchesViewModel 
          return (T) new BranchesViewModel(singletonCImpl.provideAdminApiServiceProvider.get(), singletonCImpl.provideTokenManagerProvider.get());

          case 3: // com.northend.admin.ui.erp.DashboardViewModel 
          return (T) new DashboardViewModel(singletonCImpl.provideAdminRepositoryProvider.get());

          case 4: // com.northend.admin.ui.erp.ExpensesViewModel 
          return (T) new ExpensesViewModel(singletonCImpl.provideAdminRepositoryProvider.get());

          case 5: // com.northend.admin.ui.erp.IdCardsViewModel 
          return (T) new IdCardsViewModel(singletonCImpl.provideAdminApiServiceProvider.get(), singletonCImpl.provideTokenManagerProvider.get());

          case 6: // com.northend.admin.ui.erp.LeadsViewModel 
          return (T) new LeadsViewModel(singletonCImpl.provideAdminRepositoryProvider.get());

          case 7: // com.northend.admin.ui.auth.LoginViewModel 
          return (T) new LoginViewModel(singletonCImpl.provideAdminRepositoryProvider.get());

          case 8: // com.northend.admin.ui.erp.PaymentsViewModel 
          return (T) new PaymentsViewModel(singletonCImpl.provideAdminRepositoryProvider.get());

          case 9: // com.northend.admin.ui.erp.StaffViewModel 
          return (T) new StaffViewModel(singletonCImpl.provideAdminApiServiceProvider.get(), singletonCImpl.provideTokenManagerProvider.get());

          case 10: // com.northend.admin.ui.erp.StudentsViewModel 
          return (T) new StudentsViewModel(singletonCImpl.provideAdminRepositoryProvider.get());

          case 11: // com.northend.admin.ui.erp.WhatsAppViewModel 
          return (T) new WhatsAppViewModel(singletonCImpl.provideAdminRepositoryProvider.get());

          default: throw new AssertionError(id);
        }
      }
    }
  }

  private static final class ActivityRetainedCImpl extends NorthEndApp_HiltComponents.ActivityRetainedC {
    private final SingletonCImpl singletonCImpl;

    private final ActivityRetainedCImpl activityRetainedCImpl = this;

    private Provider<ActivityRetainedLifecycle> provideActivityRetainedLifecycleProvider;

    private ActivityRetainedCImpl(SingletonCImpl singletonCImpl) {
      this.singletonCImpl = singletonCImpl;

      initialize();

    }

    @SuppressWarnings("unchecked")
    private void initialize() {
      this.provideActivityRetainedLifecycleProvider = DoubleCheck.provider(new SwitchingProvider<ActivityRetainedLifecycle>(singletonCImpl, activityRetainedCImpl, 0));
    }

    @Override
    public ActivityComponentBuilder activityComponentBuilder() {
      return new ActivityCBuilder(singletonCImpl, activityRetainedCImpl);
    }

    @Override
    public ActivityRetainedLifecycle getActivityRetainedLifecycle() {
      return provideActivityRetainedLifecycleProvider.get();
    }

    private static final class SwitchingProvider<T> implements Provider<T> {
      private final SingletonCImpl singletonCImpl;

      private final ActivityRetainedCImpl activityRetainedCImpl;

      private final int id;

      SwitchingProvider(SingletonCImpl singletonCImpl, ActivityRetainedCImpl activityRetainedCImpl,
          int id) {
        this.singletonCImpl = singletonCImpl;
        this.activityRetainedCImpl = activityRetainedCImpl;
        this.id = id;
      }

      @SuppressWarnings("unchecked")
      @Override
      public T get() {
        switch (id) {
          case 0: // dagger.hilt.android.ActivityRetainedLifecycle 
          return (T) ActivityRetainedComponentManager_LifecycleModule_ProvideActivityRetainedLifecycleFactory.provideActivityRetainedLifecycle();

          default: throw new AssertionError(id);
        }
      }
    }
  }

  private static final class ServiceCImpl extends NorthEndApp_HiltComponents.ServiceC {
    private final SingletonCImpl singletonCImpl;

    private final ServiceCImpl serviceCImpl = this;

    private ServiceCImpl(SingletonCImpl singletonCImpl, Service serviceParam) {
      this.singletonCImpl = singletonCImpl;


    }
  }

  private static final class SingletonCImpl extends NorthEndApp_HiltComponents.SingletonC {
    private final ApplicationContextModule applicationContextModule;

    private final SingletonCImpl singletonCImpl = this;

    private Provider<TokenManager> provideTokenManagerProvider;

    private Provider<AdminApiService> provideAdminApiServiceProvider;

    private Provider<OkHttpClient> provideOkHttpClientProvider;

    private Provider<Moshi> provideMoshiProvider;

    private Provider<Retrofit> provideRetrofitProvider;

    private Provider<WhatsAppDatabase> provideWhatsAppDatabaseProvider;

    private Provider<WhatsAppDao> provideWhatsAppDaoProvider;

    private Provider<AdminRepository> provideAdminRepositoryProvider;

    private SingletonCImpl(ApplicationContextModule applicationContextModuleParam) {
      this.applicationContextModule = applicationContextModuleParam;
      initialize(applicationContextModuleParam);

    }

    @SuppressWarnings("unchecked")
    private void initialize(final ApplicationContextModule applicationContextModuleParam) {
      this.provideTokenManagerProvider = DoubleCheck.provider(new SwitchingProvider<TokenManager>(singletonCImpl, 3));
      this.provideAdminApiServiceProvider = new DelegateFactory<>();
      this.provideOkHttpClientProvider = DoubleCheck.provider(new SwitchingProvider<OkHttpClient>(singletonCImpl, 2));
      this.provideMoshiProvider = DoubleCheck.provider(new SwitchingProvider<Moshi>(singletonCImpl, 4));
      this.provideRetrofitProvider = DoubleCheck.provider(new SwitchingProvider<Retrofit>(singletonCImpl, 1));
      DelegateFactory.setDelegate(provideAdminApiServiceProvider, DoubleCheck.provider(new SwitchingProvider<AdminApiService>(singletonCImpl, 0)));
      this.provideWhatsAppDatabaseProvider = DoubleCheck.provider(new SwitchingProvider<WhatsAppDatabase>(singletonCImpl, 7));
      this.provideWhatsAppDaoProvider = DoubleCheck.provider(new SwitchingProvider<WhatsAppDao>(singletonCImpl, 6));
      this.provideAdminRepositoryProvider = DoubleCheck.provider(new SwitchingProvider<AdminRepository>(singletonCImpl, 5));
    }

    @Override
    public void injectNorthEndApp(NorthEndApp northEndApp) {
    }

    @Override
    public Set<Boolean> getDisableFragmentGetContextFix() {
      return Collections.<Boolean>emptySet();
    }

    @Override
    public ActivityRetainedComponentBuilder retainedComponentBuilder() {
      return new ActivityRetainedCBuilder(singletonCImpl);
    }

    @Override
    public ServiceComponentBuilder serviceComponentBuilder() {
      return new ServiceCBuilder(singletonCImpl);
    }

    private static final class SwitchingProvider<T> implements Provider<T> {
      private final SingletonCImpl singletonCImpl;

      private final int id;

      SwitchingProvider(SingletonCImpl singletonCImpl, int id) {
        this.singletonCImpl = singletonCImpl;
        this.id = id;
      }

      @SuppressWarnings("unchecked")
      @Override
      public T get() {
        switch (id) {
          case 0: // com.northend.admin.data.remote.AdminApiService 
          return (T) NetworkModule_ProvideAdminApiServiceFactory.provideAdminApiService(singletonCImpl.provideRetrofitProvider.get());

          case 1: // retrofit2.Retrofit 
          return (T) NetworkModule_ProvideRetrofitFactory.provideRetrofit(singletonCImpl.provideOkHttpClientProvider.get(), singletonCImpl.provideMoshiProvider.get());

          case 2: // okhttp3.OkHttpClient 
          return (T) NetworkModule_ProvideOkHttpClientFactory.provideOkHttpClient(singletonCImpl.provideTokenManagerProvider.get(), DoubleCheck.lazy(singletonCImpl.provideAdminApiServiceProvider));

          case 3: // com.northend.admin.data.local.TokenManager 
          return (T) NetworkModule_ProvideTokenManagerFactory.provideTokenManager(ApplicationContextModule_ProvideContextFactory.provideContext(singletonCImpl.applicationContextModule));

          case 4: // com.squareup.moshi.Moshi 
          return (T) NetworkModule_ProvideMoshiFactory.provideMoshi();

          case 5: // com.northend.admin.data.repository.AdminRepository 
          return (T) NetworkModule_ProvideAdminRepositoryFactory.provideAdminRepository(singletonCImpl.provideAdminApiServiceProvider.get(), singletonCImpl.provideTokenManagerProvider.get(), singletonCImpl.provideWhatsAppDaoProvider.get());

          case 6: // com.northend.admin.data.local.room.WhatsAppDao 
          return (T) DatabaseModule_ProvideWhatsAppDaoFactory.provideWhatsAppDao(singletonCImpl.provideWhatsAppDatabaseProvider.get());

          case 7: // com.northend.admin.data.local.room.WhatsAppDatabase 
          return (T) DatabaseModule_ProvideWhatsAppDatabaseFactory.provideWhatsAppDatabase(ApplicationContextModule_ProvideContextFactory.provideContext(singletonCImpl.applicationContextModule));

          default: throw new AssertionError(id);
        }
      }
    }
  }
}
