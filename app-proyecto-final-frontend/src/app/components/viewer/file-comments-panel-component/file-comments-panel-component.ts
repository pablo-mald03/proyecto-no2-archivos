import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { FileComment } from '../../../features/files/models/file-comment.model';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { CustomButton } from '../../common/custom-button/custom-button';
import { FileCommentCardComponent } from '../file-comment-card-component/file-comment-card-component';
import { lucideEye, lucideMessageSquare, lucideSend, lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'app-file-comments-panel-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgIconComponent,
    CustomTextfield,
    CustomButton,
    FileCommentCardComponent
  ],
  templateUrl: './file-comments-panel-component.html',
  styleUrl: './file-comments-panel-component.css',
})
// Panel component displaying file comments, thread replies, and new comment submission
export class FileCommentsPanelComponent {
  // Inputs & Outputs
  readonly comments = input<FileComment[]>([]);
  readonly isOpen = input<boolean>(true);
  readonly isSubmitting = input<boolean>(false);
  readonly canComment = input<boolean>(true);
  readonly currentUserId = input<string | null>(null);

  readonly closePanel = output<void>();
  readonly commentAdded = output<{ content: string; parentId?: string | null }>();
  readonly commentUpdated = output<{ id: string; content: string }>();
  readonly commentDeleted = output<string>();

  // Form Control for new top-level comment
  readonly commentControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(500)]
  });

  // Icons
  readonly lucideSendIcon = lucideSend;
  readonly lucideMessageSquareIcon = lucideMessageSquare;
  readonly lucideXIcon = lucideX;
  readonly lucideEyeIcon = lucideEye;

  // Submit new top-level comment
  onSubmitComment(): void {
    if (this.isSubmitting() || !this.canComment()) return;

    if (this.commentControl.invalid) {
      this.commentControl.markAsTouched();
      return;
    }

    const text = this.commentControl.value.trim();
    if (!text) return;

    this.commentAdded.emit({ content: text });
    this.commentControl.reset();
  }

  // Handle reply submission from child card
  handleReply(event: { parentId: string; content: string }): void {
    if (!this.canComment()) return;
    this.commentAdded.emit({ content: event.content, parentId: event.parentId });
  }
}