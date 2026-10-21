import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareResponse } from '../../../features/shares/models/response/share-response.model';
import { ShareAccessLevel } from '../../../features/shares/constants/share.constants';
import { lucideCrown, lucideTrash2, lucideUser } from '@ng-icons/lucide';
import { FormControl } from '@angular/forms';
import { CustomDropdown } from '../../common/custom-dropdown/custom-dropdown';

@Component({
  selector: 'app-share-user-list-component',
  standalone: true,
  imports: [CommonModule, CustomDropdown],
  templateUrl: './share-user-list-component.html',
  styleUrl: './share-user-list-component.css'
})
// Component listing people with granted access to the resource
export class ShareUserListComponent {
  // Inputs
  readonly shares = input.required<ShareResponse[]>();
  readonly owner = input<{ username?: string; email?: string } | null>(null);
  readonly currentUserId = input<string | null>(null);

  // Outputs
  readonly accessChanged = output<{ share: ShareResponse; access: ShareAccessLevel }>();
  readonly revokeAccess = output<ShareResponse>();

  // Role options available for the dropdown (including revoke option with custom styling class)
  readonly roleOptions = [
    { value: 'VIEWER', label: 'Lector' },
    { value: 'COMMENTER', label: 'Comentador' },
    { value: 'EDITOR', label: 'Editor' },
    { value: '__REVOKE__', label: 'Quitar acceso', class: 'text-red-500 font-semibold' }
  ];

  // Map to store independent FormControls for each shared user item in the list
  private readonly controlsMap = new Map<string, FormControl<string>>();

  // Icons
  readonly lucideCrownIcon = lucideCrown;
  readonly lucideUserIcon = lucideUser;
  readonly lucideTrashIcon = lucideTrash2;

  // Method to create a reactive FormControl for a specific share item
  getRoleControl(share: ShareResponse): FormControl<string> {
    if (!this.controlsMap.has(share.id)) {
      const control = new FormControl<string>(share.access, { nonNullable: true });

      control.valueChanges.subscribe(value => {
        if (value === '__REVOKE__') {
          this.revokeAccess.emit(share);
        } else {
          this.accessChanged.emit({
            share,
            access: value as ShareAccessLevel
          });
        }
      });

      this.controlsMap.set(share.id, control);
    }
    return this.controlsMap.get(share.id)!;
  }
}