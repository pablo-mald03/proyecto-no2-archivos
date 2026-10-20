import { Component, computed, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { ShareResponse } from '../../../features/shares/models/response/share-response.model';
import { ShareAccessLevel } from '../../../features/shares/constants/share.constants';
import { lucideCheck, lucideGlobe, lucideLink, lucideLock } from '@ng-icons/lucide';
import { FormControl } from '@angular/forms';
import { CustomDropdown } from '../../common/custom-dropdown/custom-dropdown';

@Component({
  selector: 'app-share-general-access-component',
  standalone: true,
  imports: [CommonModule, NgIconComponent, CustomButton, CustomDropdown],
  templateUrl: './share-general-access-component.html',
  styleUrl: './share-general-access-component.css'
})
// General access component
export class ShareGeneralAccessComponent {
  // Inputs
  readonly anyUserShare = input<ShareResponse | null>(null);
  readonly resourceShareUrl = input<string>('');

  // Outputs
  readonly generalAccessChanged = output<{ enabled: boolean; access: ShareAccessLevel }>();
  readonly copyLinkClicked = output<void>();

  // Computed
  readonly isPublic = computed(() => !!this.anyUserShare());
  readonly accessLevel = computed(() => this.anyUserShare()?.access ?? 'VIEWER');

  // Dropdown options
  readonly modeOptions = [
    { value: 'RESTRICTED', label: 'Restringido' },
    { value: 'ANY_USER', label: 'Cualquier persona con el enlace' }
  ];

  readonly accessOptions = [
    { value: 'VIEWER', label: 'Lector' },
    { value: 'COMMENTER', label: 'Comentador' },
    { value: 'EDITOR', label: 'Editor' }
  ];

  // Form controls for custom dropdowns
  readonly modeControl = new FormControl<string>('RESTRICTED', { nonNullable: true });
  readonly accessControl = new FormControl<string>('VIEWER', { nonNullable: true });

  // Icons
  readonly lucideLockIcon = lucideLock;
  readonly lucideGlobeIcon = lucideGlobe;
  readonly lucideLinkIcon = lucideLink;
  readonly lucideCheckIcon = lucideCheck;

  constructor() {
    effect(() => {
      const publicMode = this.isPublic() ? 'ANY_USER' : 'RESTRICTED';
      this.modeControl.setValue(publicMode, { emitEvent: false });
      this.accessControl.setValue(this.accessLevel(), { emitEvent: false });
    });

    this.modeControl.valueChanges.subscribe(value => {
      this.onModeSelect(value);
    });

    this.accessControl.valueChanges.subscribe(level => {
      this.onAccessSelect(level);
    });
  }

  // Method to handle the mode selection
  onModeSelect(value: string): void {
    if (value === 'ANY_USER') {
      this.generalAccessChanged.emit({
        enabled: true,
        access: this.accessLevel()
      });
    } else {
      this.generalAccessChanged.emit({
        enabled: false,
        access: 'VIEWER'
      });
    }
  }

  // Method to handle the access level selection
  onAccessSelect(level: string): void {
    this.generalAccessChanged.emit({
      enabled: true,
      access: level as ShareAccessLevel
    });
  }
}