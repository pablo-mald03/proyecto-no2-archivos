import { Component, input, output, signal } from '@angular/core';
import { FileComment } from '../../../features/files/models/file-comment.model';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { lucideMessageSquare, lucideSend, lucideTrash2, lucideX } from '@ng-icons/lucide';
import { NgIconComponent } from '@ng-icons/core';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { CustomButton } from '../../common/custom-button/custom-button';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-file-comments-panel-component',
  standalone: true,
  imports: [NgIconComponent, CustomTextfield, CustomButton, DatePipe, FormsModule, ReactiveFormsModule],
  templateUrl: './file-comments-panel-component.html',
  styleUrl: './file-comments-panel-component.css',
})
//Principal files comments panel component
export class FileCommentsPanelComponent {
  // Inputs & Outputs
  readonly comments = input<FileComment[]>([]);
  readonly isOpen = input<boolean>(true);
  readonly isSubmitting = input<boolean>(false);

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
    if (this.isSubmitting()) return;

    if (this.commentControl.invalid) {
      this.commentControl.markAsTouched();
      return;
    }

    const text = this.commentControl.value.trim();

    if (!text) return;

    this.commentAdded.emit(text);
    this.commentControl.reset();
  }

  // Delete comment handler
  onDeleteComment(commentId: string): void {
    this.commentDeleted.emit(commentId);
  }
}