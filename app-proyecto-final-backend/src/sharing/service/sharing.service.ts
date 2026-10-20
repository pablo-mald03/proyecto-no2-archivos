import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { FilesRepository } from 'src/files/repository/files.repository';
import { FoldersRepository } from 'src/folders/repository/folders.repository';
import { UsersRepository } from 'src/users/repository/users.repository';
import { ActivityRecorderService } from 'src/activity/service/activity-recorder.service';
import { AuthUser } from 'src/users/models/auth-user.model';
import { FolderNotFoundException } from 'src/folders/exceptions/folder-not-found.exception';
import { AccessDeniedException } from 'src/common/exceptions/access-deniend.exception';
import { ActivityAction } from 'src/common/constants/actions/activity-action';
import { SharesRepository } from '../repository/shares.repository';
import { ShareResourceDto } from '../dto/request/share-resource.dto';
import { ShareResponseDto } from '../dto/response/share-response.dto';
import { InvalidShareException } from '../exceptions/invalid-share.exception';
import { ShareMapper } from '../mapper/share.mapper';
import { RevokeShareDto } from '../dto/request/revoke-share.dto';
import { SharedWithMeItemDto } from '../dto/response/shared-with-me-item.dto';
import { FileNotFoundException } from 'src/files/exceptions/file-not-found.exception';
import { GranteeType } from 'src/common/constants/permissions/grantee-type';

/*Principal sharing service class*/
@Injectable()
export class SharingService {
  constructor(
    private readonly sharesRepository: SharesRepository,
    private readonly filesRepository: FilesRepository,
    private readonly foldersRepository: FoldersRepository,
    private readonly usersRepository: UsersRepository,
    private readonly activity: ActivityRecorderService,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  /**
   * Method to share resource with multiple users or update general public access (ANY_USER)
   */
  async shareResource(resourceType: 'FILE' | 'FOLDER', resourceId: string, dto: ShareResourceDto, actor: AuthUser): Promise<ShareResponseDto[]> {
    const resource = await this.getResourceOrFail(resourceType, resourceId);

    if (resource.ownerId.toString() !== actor.id) {
      throw new AccessDeniedException('Solo el propietario puede gestionar los permisos de este recurso');
    }

    const createdResponses: ShareResponseDto[] = [];

    await this.connection.transaction(async (session) => {
      for (const entry of dto.shares) {
        let granteeOid: Types.ObjectId | null = null;
        let targetUserEmail: string | undefined;

        if (entry.granteeType === GranteeType.USER) {
          if (!entry.granteeId) {
            throw new InvalidShareException('granteeId es obligatorio cuando granteeType es USER');
          }
          if (entry.granteeId === actor.id) {
            throw new InvalidShareException('No puedes compartir un recurso contigo mismo');
          }

          const granteeUser = await this.usersRepository.findById(entry.granteeId);
          if (!granteeUser || !granteeUser.isActive) {
            throw new InvalidShareException('El usuario destinatario no existe o está inactivo');
          }

          granteeOid = granteeUser._id;
          targetUserEmail = granteeUser.email;
        }

        const shareDoc = await this.sharesRepository.upsertShare(
          {
            resourceType,
            resourceId: new Types.ObjectId(resourceId),
            ownerId: resource.ownerId,
            granteeType: entry.granteeType,
            granteeId: granteeOid,
            access: entry.access,
          },
          session,
        );

        createdResponses.push(ShareMapper.toResponse(shareDoc));

        await this.activity.recordAndWait(
          {
            actor: { id: actor.id, username: actor.username, email: actor.email },
            action: ActivityAction.ACCESS_GRANTED,
            description: `Otorgó acceso ${entry.access} en ${resourceType.toLowerCase()} "${resource.name}"`,
            resource: {
              type: resourceType,
              id: resource._id.toString(),
              name: resource.name,
            },
            target: granteeOid ? { id: granteeOid.toString(), email: targetUserEmail || '' } : undefined,
            metadata: {
              accessLevel: entry.access,
              granteeType: entry.granteeType,
            },
          },
          session,
        );
      }
    });

    return createdResponses;
  }

  /**
   * Method to list all direct shares on a file or folder
   */
  async getResourceShares(
    resourceType: 'FILE' | 'FOLDER',
    resourceId: string,
    actor: AuthUser,
  ): Promise<ShareResponseDto[]> {
    const resource = await this.getResourceOrFail(resourceType, resourceId);

    if (resource.ownerId.toString() !== actor.id) {
      throw new AccessDeniedException('Solo el propietario puede ver los permisos de este recurso');
    }

    const shares = await this.sharesRepository.findByResource(resourceType, resourceId);

    const userIds = shares
      .filter((s) => s.granteeId !== null)
      .map((s) => s.granteeId!.toString());

    const userMap = new Map<string, { email: string; username: string }>();
    if (userIds.length > 0) {
      for (const uid of userIds) {
        const u = await this.usersRepository.findById(uid);
        if (u) userMap.set(uid, { email: u.email, username: u.username });
      }
    }

    return shares.map((s) =>
      ShareMapper.toResponse(s, s.granteeId ? userMap.get(s.granteeId.toString()) : undefined),
    );
  }

  /**
   * Method to revoke a direct share or disable public ANY_USER access
   */
  async revokeShare(resourceType: 'FILE' | 'FOLDER', resourceId: string, dto: RevokeShareDto, actor: AuthUser): Promise<void> {
    const resource = await this.getResourceOrFail(resourceType, resourceId);

    if (resource.ownerId.toString() !== actor.id) {
      throw new AccessDeniedException('Solo el propietario puede retirar permisos');
    }

    await this.sharesRepository.deleteByResourceAndGrantee(
      resourceType,
      resourceId,
      dto.granteeType,
      dto.granteeId || null,
    );

    this.activity.record({
      actor: { id: actor.id, username: actor.username, email: actor.email },
      action: ActivityAction.ACCESS_REVOKED,
      description: `Retiró acceso a ${dto.granteeType} en ${resourceType.toLowerCase()} "${resource.name}"`,
      resource: {
        type: resourceType,
        id: resource._id.toString(),
        name: resource.name,
      },
      metadata: {
        granteeType: dto.granteeType,
      },
    });
  }

  /**
   * Method to list items directly shared with the authenticated user
   */
  async getSharedWithMe(actor: AuthUser): Promise<SharedWithMeItemDto[]> {
    const userOid = new Types.ObjectId(actor.id);
    const shares = await (this.sharesRepository as any).model
      .find({ granteeType: GranteeType.USER, granteeId: userOid })
      .exec();

    const results: SharedWithMeItemDto[] = [];

    for (const share of shares) {
      if (share.resourceType === 'FILE') {
        const file = await this.filesRepository.findActiveById(share.resourceId);
        if (file) {
          results.push({
            share: ShareMapper.toResponse(share),
            resource: {
              id: file._id.toString(),
              type: 'FILE',
              name: file.name,
              extension: file.extension,
              mimeType: file.mimeType,
              sizeBytes: file.sizeBytes,
              ownerId: file.ownerId.toString(),
              createdAt: file.createdAt.toISOString(),
              updatedAt: file.updatedAt.toISOString(),
            },
          });
        }
      } else {
        const folder = await this.foldersRepository.findActiveById(share.resourceId);
        if (folder) {
          results.push({
            share: ShareMapper.toResponse(share),
            resource: {
              id: folder._id.toString(),
              type: 'FOLDER',
              name: folder.name,
              ownerId: folder.ownerId.toString(),
              createdAt: folder.createdAt.toISOString(),
              updatedAt: folder.updatedAt.toISOString(),
            },
          });
        }
      }
    }

    return results;
  }

  //Method to get resource 
  private async getResourceOrFail(resourceType: 'FILE' | 'FOLDER', resourceId: string): Promise<{ _id: Types.ObjectId; name: string; ownerId: Types.ObjectId }> {
    if (resourceType === 'FILE') {
      const file = await this.filesRepository.findActiveById(resourceId);
      if (!file) throw new FileNotFoundException(resourceId);
      return file;
    } else {
      const folder = await this.foldersRepository.findActiveById(resourceId);
      if (!folder) throw new FolderNotFoundException(resourceId);
      return folder;
    }
  }
}