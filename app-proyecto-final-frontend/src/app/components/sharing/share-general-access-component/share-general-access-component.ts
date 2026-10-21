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
//Principal share general access component
export class ShareGeneralAccessComponent {
  // Inputs
  readonly anyUserShare = input<ShareResponse | null>(null);
  readonly resourceShareUrl = input<string>('');

  // Outputs
  readonly generalAccessChanged = output<{ enabled: boolean; access: ShareAccessLevel }>();
  readonly copyLinkClicked = output<void>();

  // Computed state
  readonly isPublic = computed(() => !!this.anyUserShare());
  readonly accessLevel = computed(() => this.anyUserShare()?.access ?? 'VIEWER');

  // Dropdown options
  readonly accessOptions = [
    { value: 'VIEWER', label: 'Lector' },
    { value: 'COMMENTER', label: 'Comentador' },
    { value: 'EDITOR', label: 'Editor' }
  ];

  // Form control para el nivel de acceso secundario
  readonly accessControl = new FormControl<string>(
    this.anyUserShare()?.access ?? 'VIEWER',
    { nonNullable: true }
  );

  // Icons
  readonly lucideLockIcon = lucideLock;
  readonly lucideGlobeIcon = lucideGlobe;
  readonly lucideLinkIcon = lucideLink;
  readonly lucideCheckIcon = lucideCheck;

  constructor() {
    effect(() => {
      const share = this.anyUserShare();
      const currentLevel = share?.access ?? 'VIEWER';
      if (this.accessControl.value !== currentLevel) {
        this.accessControl.setValue(currentLevel, { emitEvent: false });
      }
    });

    this.accessControl.valueChanges.subscribe(level => {
      this.onAccessSelect(level);
    });
  }

  // Method to switch mode directly via buttons with idempotency guard
  setPublicMode(enabled: boolean): void {
    if (enabled === this.isPublic()) return;

    this.generalAccessChanged.emit({
      enabled: enabled,
      access: enabled ? this.accessLevel() : 'VIEWER'
    });
  }

  // Method to handle access level selection change
  private onAccessSelect(level: string): void {
    const targetAccess = level as ShareAccessLevel;

    if (targetAccess === this.accessLevel()) return;

    this.generalAccessChanged.emit({
      enabled: true,
      access: targetAccess
    });
  }
}