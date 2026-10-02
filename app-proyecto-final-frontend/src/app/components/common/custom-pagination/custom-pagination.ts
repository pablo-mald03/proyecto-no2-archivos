import { Component, computed, input, output } from '@angular/core';
import { CustomButton } from '../custom-button/custom-button';
import { lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';

@Component({
  selector: 'app-custom-pagination',
  standalone: true,
  imports: [CustomButton],
  templateUrl: './custom-pagination.html',
  styleUrl: './custom-pagination.css',
})
/*Principal pagination component, prev/next based */
export class CustomPagination {

  //Props
  page = input.required<number>();

  totalPages = input.required<number>();

  totalElements = input<number>();

  loading = input(false);

  pageChange = output<number>();

  //Icons
  readonly lucideChevronLeftIcon = lucideChevronLeft;
  readonly lucideChevronRightIcon = lucideChevronRight;

  //Reactive variables
  readonly displayPage = computed(() => this.page() + 1);

  readonly isFirstPage = computed(() => this.page() <= 0);

  readonly isLastPage = computed(() => this.page() >= this.totalPages() - 1);

  //Method to emit the go previous page
  goPrevious(): void {

    if (this.isFirstPage() || this.loading()) {
      return;
    }

    this.pageChange.emit(this.page() - 1);
  }

  //Method to go to the next page
  goNext(): void {

    if (this.isLastPage() || this.loading()) {
      return;
    }

    this.pageChange.emit(this.page() + 1);
  }

}