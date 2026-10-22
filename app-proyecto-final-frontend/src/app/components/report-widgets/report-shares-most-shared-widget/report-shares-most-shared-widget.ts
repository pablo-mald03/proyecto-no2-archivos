import { Component, computed, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { lucideFile, lucideShare2 } from '@ng-icons/lucide';
import { ReportWidgetFrame } from '../../common/report-widget-frame/report-widget-frame';
import { MostSharedFileResponse } from '../../../features/report-shares/models/response/most-shared-file-response.model';

//Number of dots of the reach meter
const DOTS_COUNT = 10;

@Component({
  selector: 'app-report-shares-most-shared-widget',
  standalone: true,
  host: { class: 'block h-full' },
  imports: [NgIcon, ReportWidgetFrame],
  templateUrl: './report-shares-most-shared-widget.html',
  styleUrl: './report-shares-most-shared-widget.css',
})
/*Compact ranking of the most shared files with a reach meter component*/
export class ReportSharesMostSharedWidget {

  // Inputs
  files = input.required<MostSharedFileResponse[]>();
  loading = input(false);
  limit = input(5);
  showViewMore = input(false);

  // Outputs
  viewMore = output<void>();

  readonly lucideShareIcon = lucideShare2;
  readonly lucideFileIcon = lucideFile;
  readonly dots = Array.from({ length: DOTS_COUNT }, (_, index) => index);

  readonly rows = computed(() => {
    const files = this.files().slice(0, this.limit());
    const max = Math.max(...files.map(file => file.shareCount), 1);

    return files.map(file => ({
      id: file.fileId,
      name: file.fileName,
      owner: file.ownerUsername,
      count: file.shareCount,
      filled: file.shareCount > 0 ? Math.max(1, Math.round((file.shareCount / max) * DOTS_COUNT)) : 0
    }));
  });
}
