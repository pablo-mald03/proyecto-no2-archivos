import { Component, input, output } from '@angular/core';
import { FileComment } from '../../../features/files/models/file-comment.model';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { lucideMessageSquare, lucideSend, lucideTrash2, lucideX } from '@ng-icons/lucide';
import { NgIconComponent } from '@ng-icons/core';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { CustomButton } from '../../common/custom-button/custom-button';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-file-comments-panel-component',
  standalone: true,
  imports: [NgIconComponent, CustomTextfield, CustomButton, DatePipe, ReactiveFormsModule],
  templateUrl: './file-comments-panel-component.html',
  styleUrl: './file-comments-panel-component.css',
})
export class FileCommentsPanelComponent {
  // Inputs & Outputs
  readonly comments = input<FileComment[]>([]);
  readonly isOpen = input<boolean>(true);

  readonly closePanel = output<void>();
  readonly commentAdded = output<string>();
  readonly commentDeleted = output<string>();

  // Form Control for new comment
  readonly commentControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(500)]
  });

  // Icons
  readonly lucideSendIcon = lucideSend;
  readonly lucideMessageSquareIcon = lucideMessageSquare;
  readonly lucideXIcon = lucideX;
  readonly lucideTrashIcon = lucideTrash2;

  // Submit comment handler
  onSubmitComment(): void {
    if (this.commentControl.invalid) return;

    const text = this.commentControl.value.trim();
    if (text) {
      this.commentAdded.emit(text);
      this.commentControl.reset();
    }
  }

  // Delete comment handler
  onDeleteComment(commentId: string): void {
    this.commentDeleted.emit(commentId);
  }
}