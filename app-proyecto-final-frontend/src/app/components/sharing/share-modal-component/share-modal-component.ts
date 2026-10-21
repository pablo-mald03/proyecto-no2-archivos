import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomModalComponent } from '../../common/custom-modal-component/custom-modal-component';
import { CustomButton } from '../../common/custom-button/custom-button';
import { ShareUserSearchComponent } from '../share-user-search-component/share-user-search-component';
import { ShareUserListComponent } from '../share-user-list-component/share-user-list-component';
import { ShareGeneralAccessComponent } from '../share-general-access-component/share-general-access-component';
import { ShareService } from '../../../features/shares/service/share.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthState } from '../../../stores/auth.state';
import { ShareResponse } from '../../../features/shares/models/response/share-response.model';
import { ShareAccessLevel, ShareTargetType } from '../../../features/shares/constants/share.constants';
import { User } from '../../../features/users/models/user.model';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';

@Component({
  selector: 'app-share-modal-component',
  standalone: true,
  imports: [
    CommonModule,
    CustomModalComponent,
    CustomButton,
    ShareUserSearchComponent,
    ShareUserListComponent,
    ShareGeneralAccessComponent
  ],
  templateUrl: './share-modal-component.html',
  styleUrl: './share-modal-component.css'
})
// Principal sharing modal orchestrator component matching Google Drive UX
export class ShareModalComponent {
  private readonly shareService = inject(ShareService);
  private readonly toastService = inject(ToastService);
  private readonly authState = inject(AuthState);

  // Inputs
  readonly isOpen = input.required<boolean>();
  readonly resourceId = input.required<string>();
  readonly resourceName = input.required<string>();
  readonly resourceType = input<ShareTargetType>('files');

  // Outputs
  readonly closed = output<void>();

  // State
  readonly shares = signal<ShareResponse[]>([]);
  readonly loading = signal<boolean>(false);

  // Computed state
  readonly anyUserShare = computed(() =>
    this.shares().find(s => s.granteeType === 'ANY_USER') ?? null
  );

  readonly userShares = computed(() =>
    this.shares().filter(s => s.granteeType === 'USER')
  );

  readonly currentUser = computed(() => this.authState.user());

  readonly ownerInfo = computed(() => {
    const user = this.currentUser();
    return {
      username: user?.username || 'Propietario',
      email: user?.email || ''
    };
  });

  readonly resourceShareUrl = computed(() => {
    const origin = window.location.origin;
    return this.resourceType() === 'folders'
      ? `${origin}/drive/files/folder/${this.resourceId()}`
      : `${origin}/drive/files/preview/${this.resourceId()}`;
  });

  constructor() {
    effect(() => {
      if (this.isOpen() && this.resourceId()) {
        this.loadShares();
      }
    });
  }

  // Load current shares for the resource
  loadShares(): void {
    const id = this.resourceId();
    const type = this.resourceType();
    if (!id) return;

    this.loading.set(true);
    this.shareService.getResourceShares(type, id).subscribe({
      next: (data) => {
        this.shares.set(data || []);
        this.loading.set(false);
      },
      error: () => {
        this.shares.set([]);
        this.loading.set(false);
      }
    });
  }

  // Grant access to a specific user
  handleUserSelected(event: { user: User; access: ShareAccessLevel }): void {
    const type = this.resourceType();
    const id = this.resourceId();

    this.shareService.shareResource(type, id, {
      shares: [{
        granteeType: 'USER',
        granteeId: event.user.id,
        access: event.access
      }]
    }).subscribe({
      next: () => {
        this.toastService.success(
          `Acceso concedido a '${event.user.firstName || event.user.username}'.`,
          'Compartido con éxito'
        );
        this.loadShares();
      },
      error: (err: ErrorResponse) => {
        this.toastService.error(
          err.message || 'Error al compartir con el usuario.',
          'Error'
        );
      }
    });
  }

  // Update access level for an existing user share
  handleAccessChanged(event: { share: ShareResponse; access: ShareAccessLevel }): void {
    const type = this.resourceType();
    const id = this.resourceId();

    this.shareService.shareResource(type, id, {
      shares: [{
        granteeType: 'USER',
        granteeId: event.share.granteeId,
        access: event.access
      }]
    }).subscribe({
      next: () => {
        this.toastService.success(
          `Permiso actualizado a '${event.access}'.`,
          'Acceso actualizado'
        );
        this.loadShares();
      },
      error: (err: ErrorResponse) => {
        this.toastService.error(
          err.message || 'Error al actualizar el permiso.',
          'Error'
        );
      }
    });
  }

  // Revoke access for an existing user share
  handleRevokeAccess(share: ShareResponse): void {
    const type = this.resourceType();
    const id = this.resourceId();

    this.shareService.revokeShare(type, id, {
      granteeType: 'USER',
      granteeId: share.granteeId
    }).subscribe({
      next: () => {
        this.toastService.success(
          `Se quitó el acceso a '${share.granteeUsername || share.granteeEmail || 'usuario'}'.`,
          'Acceso revocado'
        );
        this.loadShares();
      },
      error: (err: ErrorResponse) => {
        this.toastService.error(
          err.message || 'Error al revocar el acceso.',
          'Error'
        );
      }
    });
  }

  // Handle general access toggle or level change (Restricted vs ANY_USER)
  handleGeneralAccessChanged(event: { enabled: boolean; access: ShareAccessLevel }): void {
    const type = this.resourceType();
    const id = this.resourceId();

    if (event.enabled) {
      this.shareService.shareResource(type, id, {
        shares: [{
          granteeType: 'ANY_USER',
          access: event.access
        }]
      }).subscribe({
        next: () => {
          this.toastService.success(
            'Cualquier persona con el enlace ahora puede acceder.',
            'Acceso general'
          );
          this.loadShares();
        },
        error: (err: ErrorResponse) => {
          this.toastService.error(
            err.message || 'Error al actualizar el acceso general.',
            'Error'
          );
        }
      });
    } else {
      this.shareService.revokeShare(type, id, {
        granteeType: 'ANY_USER'
      }).subscribe({
        next: () => {
          this.toastService.success(
            'El acceso general ahora es restringido.',
            'Acceso general'
          );
          this.loadShares();
        },
        error: (err: ErrorResponse) => {
          this.toastService.error(
            err.message || 'Error al restringir el acceso general.',
            'Error'
          );
        }
      });
    }
  }

  // Copy share URL to clipboard
  copyShareLink(): void {
    const url = this.resourceShareUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.toastService.success('Enlace copiado al portapapeles.', 'Compartir');
      }).catch(() => {
        this.toastService.info(url, 'Enlace para compartir');
      });
    } else {
      this.toastService.info(url, 'Enlace para compartir');
    }
  }

  close(): void {
    this.closed.emit();
  }
}
