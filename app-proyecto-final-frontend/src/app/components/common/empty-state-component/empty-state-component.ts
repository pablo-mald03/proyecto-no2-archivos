import { Component, input } from '@angular/core';
import { NgIconComponent, IconType } from '@ng-icons/core';
import { lucideFolderOpen, lucideLoader } from '@ng-icons/lucide';

@Component({
  selector: 'app-empty-state-component',
  standalone: true,
  imports: [NgIconComponent],
  templateUrl: './empty-state-component.html',
  styleUrl: './empty-state-component.css',
})
//Principal Empty State Component
export class EmptyStateComponent {

  // Props
  title = input<string>();
  description = input<string>();

  icon = input<IconType | string>(lucideFolderOpen);

  loading = input<boolean>(false);
  loadingText = input<string>('Cargando contenido...');

  readonly lucideLoader2Icon = lucideLoader;
}