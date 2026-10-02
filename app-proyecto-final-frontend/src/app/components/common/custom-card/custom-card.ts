import { Component, contentChild, input } from '@angular/core';
import { CardActionsDirective } from './types/card-actions.directive';

@Component({
  selector: 'app-custom-card',
  standalone: true,
  imports: [],
  templateUrl: './custom-card.html',
  styleUrl: './custom-card.css',
})
/*Principal custom card component*/
export class CustomCard {

  bordered = input(true);

  hoverable = input(true);

  bodyClass = input<string>('');

  readonly actions = contentChild(CardActionsDirective);
}