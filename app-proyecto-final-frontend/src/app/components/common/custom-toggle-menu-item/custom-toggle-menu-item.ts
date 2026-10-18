import { Component, input, output } from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-custom-toggle-menu-item',
  standalone: true,
  imports: [NgIconComponent],
  templateUrl: './custom-toggle-menu-item.html',
  styleUrl: './custom-toggle-menu-item.css',
})
/*Principal custo toggle menu item component */
export class CustomToggleMenuItem {

  readonly icon = input<string>();
  readonly clicked = output<void>()
}
