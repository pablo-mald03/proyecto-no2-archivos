import { Component, computed, input, output } from '@angular/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { lucideFileSliders, lucideHardDrive, lucidePencil } from '@ng-icons/lucide';
import { NgIcon } from '@ng-icons/core';
import { CustomCard } from '../../common/custom-card/custom-card';
import { SystemSetting } from '../../../features/settings/models/setting.model';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-settings-card',
  standalone: true,
  imports: [
    DecimalPipe,
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