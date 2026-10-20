import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { CustomButton } from '../../common/custom-button/custom-button';
import { UserService } from '../../../features/users/service/user.service';
import { User } from '../../../features/users/models/user.model';
import { UserQuery } from '../../../features/users/models/query/user-query.model';
import { ShareAccessLevel } from '../../../features/shares/constants/share.constants';
import {
  lucideArrowUpDown,
  lucideCheck,
  lucideSearch,
  lucideUserPlus,
  lucideUsers,
  lucideX
} from '@ng-icons/lucide';
import { CustomDropdown } from '../../common/custom-dropdown/custom-dropdown';

interface SortPreset {
  id: string;
  label: string;
  sortBy: UserQuery['sortBy'];
  direction: UserQuery['direction'];
}

@Component({
  selector: 'app-share-user-search-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgIconComponent,
    CustomTextfield,
    CustomButton,
    CustomDropdown
  ],
  templateUrl: './share-user-search-component.html',
  styleUrl: './share-user-search-component.css'
})
// Principal share users component
export class ShareUserSearchComponent {
  private readonly userService = inject(UserService);

  // Outputs
  readonly userSelected = output<{ user: User; access: ShareAccessLevel }>();

  // State
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly searchResults = signal<User[]>([]);
  readonly searching = signal<boolean>(false);
  readonly selectedUser = signal<User | null>(null);
  readonly selectedAccess = signal<ShareAccessLevel>('VIEWER');
  readonly isDropdownOpen = signal<boolean>(false);

  // Filter Presets
  readonly sortPresets: SortPreset[] = [
    { id: 'name_asc', label: 'Nombre (A-Z)', sortBy: 'firstName', direction: 'asc' },
    { id: 'name_desc', label: 'Nombre (Z-A)', sortBy: 'firstName', direction: 'desc' },
    { id: 'username_asc', label: 'Usuario (A-Z)', sortBy: 'username', direction: 'asc' },
    { id: 'email_asc', label: 'Correo (A-Z)', sortBy: 'email', direction: 'asc' },
    { id: 'created_desc', label: 'Más recientes', sortBy: 'createdAt', direction: 'desc' }
  ];

  readonly currentPreset = signal<SortPreset>(this.sortPresets[0]);

  //Options for access level for share with users
  readonly accessOptions = [
    { value: 'VIEWER', label: 'Lector' },
    { value: 'COMMENTER', label: 'Comentador' },
    { value: 'EDITOR', label: 'Editor' }
  ];

  //Controls for dropdowns
  readonly presetControl = new FormControl('name_asc', { nonNullable: true });
  readonly accessControl = new FormControl<ShareAccessLevel>('VIEWER', { nonNullable: true });

  // Icons
  readonly lucideSearchIcon = lucideSearch;
  readonly lucideUsersIcon = lucideUsers;
  readonly lucideUserPlusIcon = lucideUserPlus;
  readonly lucideXIcon = lucideX;
  readonly lucideCheckIcon = lucideCheck;
  readonly lucideArrowUpDownIcon = lucideArrowUpDown;

  private searchDebounceTimer?: any;

  constructor() {
    this.searchControl.valueChanges.subscribe(val => {
      this.onSearchInput(val);
    });

    this.presetControl.valueChanges.subscribe(id => {
      this.changePreset(id);
    });

    this.accessControl.valueChanges.subscribe(level => {
      this.setAccessLevel(level as ShareAccessLevel);
    });
  }

  //Method to handle search input
  onSearchInput(val: string): void {
    clearTimeout(this.searchDebounceTimer);
    const query = (val || '').trim();

    if (!query) {
      this.searchResults.set([]);
      this.isDropdownOpen.set(false);
      this.searching.set(false);
      return;
    }

    this.searching.set(true);
    this.searchDebounceTimer = setTimeout(() => {
      this.executeUserSearch(query);
    }, 300);
  }

  //Method to excecute API user search with roleCode USER preset
  private executeUserSearch(query: string): void {
    const preset = this.currentPreset();
    this.userService.getRegisteredUsers({
      search: query,
      sortBy: preset.sortBy,
      direction: preset.direction,
      page: 0,
      size: 8,
      isActive: true
    }).subscribe({
      next: (page) => {
        this.searchResults.set(page.content || []);
        this.searching.set(false);
        this.isDropdownOpen.set(true);
      },
      error: () => {
        this.searchResults.set([]);
        this.searching.set(false);
      }
    });
  }

  //Method to change preset and execute search
  changePreset(presetId: string): void {
    const found = this.sortPresets.find(p => p.id === presetId);
    if (found) {
      this.currentPreset.set(found);
      const query = this.searchControl.value.trim();
      if (query) {
        this.executeUserSearch(query);
      }
    }
  }

  //Method to select user
  selectUser(user: User): void {
    this.selectedUser.set(user);
    this.searchControl.setValue('', { emitEvent: false });
    this.searchResults.set([]);
    this.isDropdownOpen.set(false);
  }

  //Method to clear selected user
  clearSelectedUser(): void {
    this.selectedUser.set(null);
  }

  setAccessLevel(level: ShareAccessLevel): void {
    this.selectedAccess.set(level);
  }

  //Method to confirm share
  confirmShare(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.userSelected.emit({
      user,
      access: this.selectedAccess()
    });

    this.clearSelectedUser();
  }
}