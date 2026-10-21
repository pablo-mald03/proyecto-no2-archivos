import { Component, forwardRef, input, output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { FileComment } from '../../../features/files/models/file-comment.model';
import {
  lucideCheck,
  lucideCornerDownRight,
  lucidePencil,
  lucideReply,
  lucideSend,
  lucideTrash2,
  lucideX
} from '@ng-icons/lucide';

@Component({
  selector: 'app-file-comment-card-component',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    NgIconComponent,
    CustomCard,
    CustomButton,
    CustomTextfield,
    forwardRef(() => FileCommentCardComponent)
  ],
  templateUrl: './file-comment-card-component.html',
  styleUrl: './file-comment-card-component.css'
})
// Individual decorative comment card supporting inline editing, replies, and threaded discussion
export class FileCommentCardComponent {
  // Inputs
  readonly comment = input.required<FileComment>();
  readonly canComment = input<boolean>(true);
  readonly currentUserId = input<string | null>(null);
  readonly isChild = input<boolean>(false);

  // Outputs
  readonly commentUpdated = output<{ id: string; content: string }>();
  readonly commentDeleted = output<string>();
  readonly replySubmitted = output<{ parentId: string; content: string }>();

  // State
  readonly isEditing = signal<boolean>(false);
  readonly isReplying = signal<boolean>(false);

  // Forms
  readonly editControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(500)]
  });

  readonly replyControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(500)]
  });

  // Icons
  readonly lucidePencilIcon = lucidePencil;
  readonly lucideTrashIcon = lucideTrash2;
  readonly lucideReplyIcon = lucideReply;
  readonly lucideCornerDownRightIcon = lucideCornerDownRight;
  readonly lucideCheckIcon = lucideCheck;
  readonly lucideXIcon = lucideX;
  readonly lucideSendIcon = lucideSend;

  startEdit(): void {
    this.editControl.setValue(this.comment().content);
    this.isEditing.set(true);
    this.isReplying.set(false);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  saveEdit(): void {
    if (this.editControl.invalid) {
      this.editControl.markAsTouched();
      return;
    }
    const updated = this.editControl.value.trim();
    if (!updated || updated === this.comment().content) {
      this.cancelEdit();
      return;
    }

    this.commentUpdated.emit({ id: this.comment().id, content: updated });
    this.isEditing.set(false);
  }

  startReply(): void {
    this.replyControl.reset();
    this.isReplying.update(v => !v);
    this.isEditing.set(false);
  }

  cancelReply(): void {
    this.isReplying.set(false);
  }

  sendReply(): void {
    if (this.replyControl.invalid) {
      this.replyControl.markAsTouched();
      return;
    }
    const replyText = this.replyControl.value.trim();
    if (!replyText) return;

    this.replySubmitted.emit({
      parentId: this.comment().id,
      content: replyText
    });
    this.replyControl.reset();
    this.isReplying.set(false);
  }

  deleteComment(): void {
    this.commentDeleted.emit(this.comment().id);
  }
}
