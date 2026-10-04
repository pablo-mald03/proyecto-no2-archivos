import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { LandingSection } from '../landing-topbar/types/landing.types';

@Component({
  selector: 'app-landing-mobile-sidebar',
  imports: [NgIcon],
  providers: [
    provideIcons({
      lucideX
    })
  ],
  templateUrl: './landing-mobile-sidebar.html',
  styleUrl: './landing-mobile-sidebar.css'
})
export class LandingMobileSidebar {

  readonly lucideXIcon = lucideX;

  
  open = input(false);

  sectionSelected = output<LandingSection>();

  closed = output<void>();


  selectSection(section: LandingSection): void {

    this.sectionSelected.emit(section);
    this.closed.emit();

  }

}