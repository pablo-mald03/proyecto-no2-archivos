import { Component, ElementRef, HostListener, inject, OnInit, output, signal } from '@angular/core';
import { FolderService } from '../../../features/folders/service/folder.service';
import { UserService } from '../../../features/users/service/user.service';
import { FolderResponse } from '../../../features/folders/models/response/folder-response.model';
import { User } from '../../../features/users/models/user.model';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize, Subscription } from 'rxjs';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { CommonModule } from '@angular/common';
import { lucideCheck, lucideChevronDown, lucideFolder, lucideSearch, lucideUser, lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'app-report-user-folder-filter-bar-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  providers: [
    provideIcons({
      lucideSearch,
      lucideUser,
      lucideFolder,
      lucideChevronDown,
      lucideX,
      lucideCheck
    })
  ],
  templateUrl: './report-user-folder-filter-bar-component.html',
  styleUrl: './report-user-folder-filter-bar-component.css',
})
export class ReportUserFolderFilterBarComponent implements OnInit {

  private readonly userService = inject(UserService);
  private readonly folderService = inject(FolderService);
  private readonly elementRef = inject(ElementRef);

  // Outputs
  readonly selectionChange = output<{ user: User | null; folder: FolderResponse | null }>();

  // Signals
  readonly selectedUser = signal<User | null>(null);
  readonly selectedFolder = signal<FolderResponse | null>(null);

  readonly usersList = signal<User[]>([]);
  readonly foldersList = signal<FolderResponse[]>([]);

  readonly loadingUsers = signal(false);
  readonly loadingFolders = signal(false);

  readonly isUserOpen = signal(false);
  readonly isFolderOpen = signal(false);

  // Controls
  readonly userSearchCtrl = new FormControl('');
  readonly folderSearchCtrl = new FormControl('');

  private usersSub?: Subscription;
  private foldersSub?: Subscription;

  ngOnInit(): void {
    // Búsqueda reactiva de usuarios con debounce
    this.userSearchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(search => {
      this.fetchUsers(search || '');
    });

    // Búsqueda reactiva de carpetas
    this.folderSearchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(search => {
      this.fetchFolders(search || '');
    });

    // Carga inicial de primeros usuarios
    this.fetchUsers('');
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isUserOpen.set(false);
      this.isFolderOpen.set(false);
    }
  }

  toggleUserDropdown(): void {
    this.isFolderOpen.set(false);
    this.isUserOpen.update(v => !v);
  }

  toggleFolderDropdown(): void {
    if (!this.selectedUser()) return;
    this.isUserOpen.set(false);
    this.isFolderOpen.update(v => !v);
  }

  // Users Fetching
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

  // Folders Fetching
  fetchFolders(search: string): void {
    const user = this.selectedUser();
    if (!user) return;

    this.foldersSub?.unsubscribe();
    this.loadingFolders.set(true);

    this.foldersSub = this.folderService.findFoldersByUser({
      userId: user.id,
      page: 0,
      size: 50,
      sortBy: 'name',
      direction: 'asc',
      search: search.trim() || undefined
    })
      .pipe(finalize(() => this.loadingFolders.set(false)))
      .subscribe({
        next: (res) => this.foldersList.set(res.content ?? []),
        error: () => this.foldersList.set([])
      });
  }

  selectUser(user: User): void {
    this.selectedUser.set(user);
    this.selectedFolder.set(null);
    this.isUserOpen.set(false);
    this.fetchFolders('');
    this.emitChange();
  }

  selectFolder(folder: FolderResponse): void {
    this.selectedFolder.set(folder);
    this.isFolderOpen.set(false);
    this.emitChange();
  }

  clearUser(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedUser.set(null);
    this.selectedFolder.set(null);
    this.foldersList.set([]);
    this.emitChange();
  }

  clearFolder(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedFolder.set(null);
    this.emitChange();
  }

  private emitChange(): void {
    this.selectionChange.emit({
      user: this.selectedUser(),
      folder: this.selectedFolder()
    });
  }
}