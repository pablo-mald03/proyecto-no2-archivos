import { Component, computed, input, output } from '@angular/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { lucideFileSliders, lucideHardDrive, lucidePencil } from '@ng-icons/lucide';
import { NgIcon } from '@ng-icons/core';
import { CustomCard } from '../../common/custom-card/custom-card';
import { SystemSetting } from '../../../features/settings/models/setting.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-settings-card',
  standalone: true,
  imports: [
    NgIcon,
    CustomCard,
    CustomButton,
    DatePipe
  ],
  templateUrl: './settings-card.html',
  styleUrl: './settings-card.css',
})
export class SettingCardComponent {

  // Inputs
  readonly setting = input.required<SystemSetting>();
  readonly canEdit = input(false);

  // Outputs
  readonly editClicked = output<SystemSetting>();

  // Icons
  readonly lucideEditIcon = lucidePencil;
  readonly lucideSettingsIcon = lucideFileSliders;
  readonly lucideStorageIcon = lucideHardDrive;

  readonly isStorageSetting = computed(() => {
    const key = this.setting().key.toLowerCase();
    return key.includes('storage') || key.includes('quota') || key.includes('bytes');
  });

  readonly categoryBadgeClass = computed(() => {
    const cat = this.setting().category;
    const base = 'shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase ';

    if (cat === 'STORAGE') {
      return base + 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    }
    if (cat === 'USERS') {
      return base + 'bg-purple-500/10 border-purple-500/20 text-purple-400';
    }
    return base + 'bg-surface-raised border-border text-text-muted';
  });

  // Formatted value display forced primarily in Megabytes (MB)
  readonly formattedValue = computed(() => {
    const val = this.setting().value;

    if (typeof val !== 'number' && isNaN(Number(val))) {
      return val;
    }

    const numVal = Number(val);

    if (this.isStorageSetting() && numVal >= 1024) {
      const mb = numVal / (1024 * 1024);
      const gb = mb / 1024;

      return `${gb.toLocaleString('es-GT', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} GB (${mb.toLocaleString('es-GT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} MB)`;
    }

    return numVal.toLocaleString();
  });

  // Trigger edit event
  edit(): void {
    this.editClicked.emit(this.setting());
  }

}