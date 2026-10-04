import { Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { AuthState } from '../../../stores/auth.state';
import { SidebarOption } from '../sidebar/options/sidebar.options';
import { lucideChevronDown } from '@ng-icons/lucide';

@Component({
  selector: 'app-sidebar-item',
  imports: [
    RouterLink,
    RouterLinkActive,
    NgIcon
  ],
  providers: [

    provideIcons({
      lucideChevronDown
    })

  ],
  templateUrl: './sidebar-item.html',
  styleUrl: './sidebar-item.css',
})
// Principal side bar child item for sidebar nav
export class SidebarItem {

  private readonly authState = inject(AuthState);

  option = input.required<SidebarOption>();

  collapsed = input(false);

  expanded = signal(false);

  optionSelected = output<void>();

  hasChildren =
    computed(() =>
      !!this.option().children?.length
    );

  visibleChildren =
    computed(() =>
      (this.option().children ?? [])
        .filter(child =>
          !child.permission ||
          this.authState.hasPermission(
            child.permission
          )
        )
    );

  toggle(): void {

    if (!this.hasChildren()) {
      return;
    }

    this.expanded.update(
      value => !value
    );
  }

  selectOption(): void {
    this.optionSelected.emit();
  }

}