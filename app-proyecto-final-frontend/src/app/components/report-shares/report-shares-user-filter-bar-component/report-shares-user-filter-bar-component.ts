import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, input, OnInit, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { CustomDropdown } from '../../common/custom-dropdown/custom-dropdown';
import { CustomDatepicker } from '../../common/custom-datepicker/custom-datepicker';
import { CustomButton } from '../../common/custom-button/custom-button';
import { lucideCheck, lucideChevronDown, lucideFilter, lucideLoader, lucideRotateCcw, lucideSearch, lucideUser, lucideX } from '@ng-icons/lucide';
import { UserService } from '../../../features/users/service/user.service';
import { FilterDirectionOption } from '../report-shares-filter-bar-component/constants/filter-direction.constant';
import { ReportSharesQueryParams } from '../../../features/report-shares/models/query/report-share-query-param.model';
import { User } from '../../../features/users/models/user.model';
import { debounceTime, distinctUntilChanged, finalize, Subscription } from 'rxjs';

@Component({
  selector: 'app-report-shares-user-filter-bar-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgIconComponent,
    CustomTextfield,
    CustomDropdown,
    CustomDatepicker,
    CustomButton
  ],
  providers: [
    provideIcons({
      lucideSearch,
      lucideUser,
      lucideChevronDown,
      lucideX,
      lucideCheck,
      lucideLoader,
      lucideFilter
    })
  ],
  templateUrl: './report-shares-user-filter-bar-component.html',
  styleUrl: './report-shares-user-filter-bar-component.css',
})
/* Filter bar combining user selection and shares search controls */
export class ReportSharesUserFilterBarComponent implements OnInit {

  private readonly userService = inject(UserService);
  private readonly elementRef = inject(ElementRef);

  // INPUTS
  searchPlaceholder = input<string>('Nombre del recurso recibido...');
  defaultDirection = input<'asc' | 'desc'>('desc');
  directionOptions = input<FilterDirectionOption[]>([
    { key: 'desc', label: 'Más recientes primero' },
    { key: 'asc', label: 'Más antiguos primero' }
  ]);

  // OUTPUTS
  readonly selectionChange = output<{ user: User | null; filters: ReportSharesQueryParams }>();

  // SIGNALS FOR USER SELECTOR
  readonly selectedUser = signal<User | null>(null);
  readonly usersList = signal<User[]>([]);
  readonly loadingUsers = signal(false);
  readonly isUserOpen = signal(false);

  // CONTROLS FOR FILTERS
  readonly userSearchCtrl = new FormControl('');
  readonly searchCtrl = new FormControl('');
  readonly resourceTypeCtrl = new FormControl('');
  readonly directionCtrl = new FormControl<'asc' | 'desc'>('desc');
  readonly dateFromCtrl = new FormControl('');
  readonly dateToCtrl = new FormControl('');

  readonly lucideRotateCcwIcon = lucideRotateCcw;
  readonly lucideSearchIcon = lucideSearch;

  // DROPDOWN OPTIONS
  readonly resourceTypeOptions = [
    { key: '', label: 'Todos los recursos' },
    { key: 'FILE', label: 'Solo Archivos' },
    { key: 'FOLDER', label: 'Solo Carpetas' }
  ];

  readonly lucideFilterIcon = lucideFilter;

  private usersSub?: Subscription;

  /* Method to initialize the component */
  ngOnInit(): void {
    this.directionCtrl.setValue(this.defaultDirection(), { emitEvent: false });

    this.userSearchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(search => {
      this.fetchUsers(search || '');
    });

    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.emitState());

    this.resourceTypeCtrl.valueChanges.subscribe(() => this.emitState());
    this.directionCtrl.valueChanges.subscribe(() => this.emitState());
    this.dateFromCtrl.valueChanges.subscribe(() => this.emitState());
    this.dateToCtrl.valueChanges.subscribe(() => this.emitState());

    this.fetchUsers('');
  }

  /* Method to close the user dropdown when clicking outside */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isUserOpen.set(false);
    }
  }

  /* Method to toggle the user dropdown */
  toggleUserDropdown(): void {
    this.isUserOpen.update(v => !v);
  }

  /* Method to fetch users with debounce */
  fetchUsers(search: string): void {
    this.usersSub?.unsubscribe();
    this.loadingUsers.set(true);

    this.usersSub = this.userService.getRegisteredUsers({
      page: 0,
      size: 50,
      search: search.trim() || undefined
    })
      .pipe(finalize(() => this.loadingUsers.set(false)))
      .subscribe({
        next: (res) => this.usersList.set(res.content ?? []),
        error: () => this.usersList.set([])
      });
  }

  /* Method to select a user */
  selectUser(user: User): void {
    this.selectedUser.set(user);
    this.isUserOpen.set(false);
    this.emitState();
  }

  /* Method to clear the selected user */
  clearUser(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedUser.set(null);
    this.resetFilters();
  }

  /* Computed property to check if there are active filters */
  get hasActiveFilters(): boolean {
    return !!(
      this.searchCtrl.value ||
      this.resourceTypeCtrl.value ||
      this.directionCtrl.value !== this.defaultDirection() ||
      this.dateFromCtrl.value ||
      this.dateToCtrl.value
    );
  }

  /* Method to reset the filters */
  resetFilters(): void {
    this.searchCtrl.setValue('', { emitEvent: false });
    this.resourceTypeCtrl.setValue('', { emitEvent: false });
    this.directionCtrl.setValue(this.defaultDirection(), { emitEvent: false });
    this.dateFromCtrl.setValue('', { emitEvent: false });
    this.dateToCtrl.setValue('', { emitEvent: false });
    this.emitState();
  }

  /* Method to emit the current state of the filters */
  private emitState(): void {
    this.selectionChange.emit({
      user: this.selectedUser(),
      filters: {
        search: this.searchCtrl.value || undefined,
        resourceType: (this.resourceTypeCtrl.value as 'FILE' | 'FOLDER') || undefined,
        direction: this.directionCtrl.value || this.defaultDirection(),
        dateFrom: this.dateFromCtrl.value || undefined,
        dateTo: this.dateToCtrl.value || undefined
      }
    });
  }
}