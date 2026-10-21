import { NgClass } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-custom-pagination-slide',
  standalone: true,
  imports: [NgIconComponent,NgClass],
  templateUrl: './custom-pagination-slide.html',
  styleUrl: './custom-pagination-slide.css',
})
export class CustomPaginationSlide {

  // Inputs basados en Signals (Sin decorador @Input)
  readonly page = input<number>(0);
  readonly totalPages = input<number>(0);
  readonly totalElements = input<number>(0);
  readonly size = input<number>(8);
  readonly loading = input<boolean>(false);

  readonly pageChange = output<number>();

  // Rangos calculados como Signals
  readonly startItem = computed(() => {
    if (this.totalElements() === 0) return 0;
    return this.page() * this.size() + 1;
  });

  readonly endItem = computed(() => {
    return Math.min((this.page() + 1) * this.size(), this.totalElements());
  });

  // Visible pages
  readonly visiblePages = computed(() => {
    const current = this.page();
    const total = this.totalPages();
    if (total <= 1) return [0];

    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(0, current - 2);
    let end = Math.min(total - 1, current + 2);

    if (current <= 2) {
      end = Math.min(total - 1, maxVisible - 1);
    } else if (current >= total - 3) {
      start = Math.max(0, total - maxVisible);
    }

    if (start > 0) {
      pages.push(0);
      if (start > 1) pages.push(-1); 
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < total - 1) {
      if (end < total - 2) pages.push(-1);
      pages.push(total - 1);
    }

    return pages;
  });

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages() && p !== this.page() && !this.loading()) {
      this.pageChange.emit(p);
    }
  }
}