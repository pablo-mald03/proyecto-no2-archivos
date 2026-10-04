import { Component, computed, inject, OnInit } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { CustomCard } from '../../common/custom-card/custom-card';
import { lucideArrowRight, lucideBoxes, lucideFileText, lucidePackage, lucideShoppingCart, lucideUserPlus, lucideUsers, lucideWarehouse } from '@ng-icons/lucide';
import { Router } from '@angular/router';
import { AuthState } from '../../../stores/auth.state';
import { ToastService } from '../../../core/services/toast.service';
import { CustomAlert } from '../../common/custom-alert/custom-alert';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    NgIcon,
    CustomCard,
    CustomAlert
  ],
  viewProviders: [
    provideIcons({
      lucideArrowRight,
      lucideBoxes,
      lucideShoppingCart,
      lucideUsers,
      lucideWarehouse,
      lucidePackage,
      lucideUserPlus,
      lucideFileText
    })
  ],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css',
})
/*Principal dashboard home page*/
export class DashboardHome implements OnInit {

  //Dependencies
  private readonly router = inject(Router);
  private readonly authState = inject(AuthState);
  private readonly toastService = inject(ToastService);

  //Icons
  readonly lucideArrowRightIcon = lucideArrowRight;
  readonly lucideBoxesIcon = lucideBoxes;
  readonly lucideShoppingCartIcon = lucideShoppingCart;
  readonly lucideUsersIcon = lucideUsers;
  readonly lucideWarehouseIcon = lucideWarehouse;
  readonly lucidePackageIcon = lucidePackage;
  readonly lucideUserPlusIcon = lucideUserPlus;
  readonly lucideFileTextIcon = lucideFileText;

  //Preview limit
  private readonly PREVIEW_LIMIT = 5;


  //Permissions
  readonly canSeeTopCustomers = computed(() =>
    this.authState.hasPermission('reportes:top_clientes')
  );

  //Permissions
  readonly canSeeTopSold = computed(() =>
    this.authState.hasPermission('reportes:top_productos_vendidos')
  );

  readonly canSeeTopProviders = computed(() =>
    this.authState.hasPermission('reportes:top_proveedores')
  );

  readonly canSeeMostPurchased = computed(() =>
    this.authState.hasPermission('reportes:productos_mas_adquiridos')
  );

  readonly canCreateProduct = computed(() =>
    this.authState.hasPermission('productos:crear')
  );

  readonly canCreatePurchase = computed(() =>
    this.authState.hasPermission('compras:crear')
  );

  readonly canCreateSale = computed(() =>
    this.authState.hasPermission('ventas:crear')
  );

  readonly canManageUsers = computed(() =>
    this.authState.hasPermission('usuarios:consultar')
  );

  readonly canViewInventory = computed(() =>
    this.authState.hasPermission('inventario:consultar')
  );

  //Permissions
  readonly canSeeTopRevenue = computed(() =>
    this.authState.hasPermission('reportes:top_productos_ingresos')
  );

  //Top revenue preview state
  // readonly topRevenue = signal<TopProductRevenue[]>([]);
  // readonly topRevenueLoading = signal(false);


  //Top sold preview state
  // readonly topSold = signal<TopSoldProduct[]>([]);
  // readonly topSoldLoading = signal(false);

  // //Top providers preview state
  // readonly topProviders = signal<TopProvider[]>([]);
  // readonly topProvidersLoading = signal(false);

  // //Most purchased preview state
  // readonly mostPurchased = signal<MostPurchasedProduct[]>([]);
  // readonly mostPurchasedLoading = signal(false);

  // readonly topCustomers = signal<TopCustomer[]>([]);
  // readonly topCustomersLoading = signal(false);

  //On init
  ngOnInit(): void {
    // if (this.canSeeTopSold()) {
    //   this.loadTopSoldPreview();
    // }

    // if (this.canSeeTopProviders()) {
    //   this.loadTopProvidersPreview();
    // }

    // if (this.canSeeMostPurchased()) {
    //   this.loadMostPurchasedPreview();
    // }
    // if (this.canSeeTopCustomers()) {
    //   this.loadTopCustomersPreview();
    // }

    // if (this.canSeeTopRevenue()) {
    //   this.loadTopRevenuePreview();
    // }
  }

  //Load top revenue preview
  // private loadTopRevenuePreview(): void {
  //   this.topRevenueLoading.set(true);

  //   this.reportSaleService.getTopProductsByRevenue({ limit: this.PREVIEW_LIMIT })
  //     .pipe(finalize(() => this.topRevenueLoading.set(false)))
  //     .subscribe({
  //       next: (response) => this.topRevenue.set(response),
  //       error: () => { /* silent */ }
  //     });
  // }

  //Navigation
  goToTopRevenueReport(): void {
    this.router.navigate(['/dashboard/reports/sales/top-products-by-revenue']);
  }

  // private loadTopCustomersPreview(): void {
  //   this.topCustomersLoading.set(true);

  //   this.reportSaleService.getTopCustomers({ limit: this.PREVIEW_LIMIT })
  //     .pipe(finalize(() => this.topCustomersLoading.set(false)))
  //     .subscribe({
  //       next: (response) => this.topCustomers.set(response),
  //       error: () => { }
  //     });
  // }

  //Load top sold preview
  // private loadTopSoldPreview(): void {
  //   this.topSoldLoading.set(true);

  //   this.reportService.getTopSoldProducts({ limit: this.PREVIEW_LIMIT })
  //     .pipe(finalize(() => this.topSoldLoading.set(false)))
  //     .subscribe({
  //       next: (response) => this.topSold.set(response),
  //       error: (error: ErrorResponse) => {
  //         this.toastService.error(
  //           error.message || 'No fue posible cargar el top de productos vendidos.',
  //           'Error al cargar dashboard'
  //         );
  //       }
  //     });
  // }

  //Load top providers preview
  // private loadTopProvidersPreview(): void {
  //   this.topProvidersLoading.set(true);

  //   this.reportPurchaseService.getTopProviders({ limit: this.PREVIEW_LIMIT })
  //     .pipe(finalize(() => this.topProvidersLoading.set(false)))
  //     .subscribe({
  //       next: (response) => this.topProviders.set(response),
  //       error: () => { /* silent */ }
  //     });
  // }

  //Load most purchased preview
  // private loadMostPurchasedPreview(): void {
  //   this.mostPurchasedLoading.set(true);

  //   this.reportPurchaseService.getMostPurchasedProducts({ page: 0, size: this.PREVIEW_LIMIT })
  //     .pipe(finalize(() => this.mostPurchasedLoading.set(false)))
  //     .subscribe({
  //       next: (response) => this.mostPurchased.set(response.content),
  //       error: () => { /* silent */ }
  //     });
  // }

  //Navigation shortcut
  goToTopCustomersReport(): void {
    this.router.navigate(['/dashboard/reports/sales/top-customers']);
  }

  //Navigation shortcuts
  goToTopSoldReport(): void {
    this.router.navigate(['/dashboard/reports/inventory/top-sold']);
  }

  goToTopProvidersReport(): void {
    this.router.navigate(['/dashboard/reports/purchases/top-providers']);
  }

  goToMostPurchasedReport(): void {
    this.router.navigate(['/dashboard/reports/purchases/most-purchased-products']);
  }

  goToCreateProduct(): void {
    this.router.navigate(['/dashboard/products/create']);
  }

  goToCreatePurchase(): void {
    this.router.navigate(['/dashboard/purchases/create']);
  }

  goToUsers(): void {
    this.router.navigate(['/dashboard/administration/users']);
  }

  goToSales(): void {
    this.router.navigate(['/dashboard/sales']);
  }

  goToInventory(): void {
    this.router.navigate(['/dashboard/inventory']);
  }
}