import { Component, ElementRef, input, output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-custom-infinite-scroll',
  standalone: true,
  imports: [],
  templateUrl: './custom-infinite-scroll.html',
  styleUrl: './custom-infinite-scroll.css',
})
/*Custom infinite scroll*/
export class CustomInfiniteScroll {

  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef<HTMLElement>;

  loading = input(false);
  hasMore = input(true);
  threshold = input(200);

  loadMore = output<void>();

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;

    const distanceToBottom =
      element.scrollHeight -
      element.scrollTop -
      element.clientHeight;

    if (
      distanceToBottom <= this.threshold() &&
      this.hasMore() &&
      !this.loading()
    ) {
      this.loadMore.emit();
    }
  }
}