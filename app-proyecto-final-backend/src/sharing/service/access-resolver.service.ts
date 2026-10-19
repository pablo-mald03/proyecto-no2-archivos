import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { AccessLevel, ACCESS_LEVEL_RANK } from 'src/common/constants/permissions/access-level';
import { AccessDeniedException } from 'src/common/exceptions/access-deniend.exception';
import { SharesRepository } from '../repository/shares.repository';
import { ResourceTarget } from '../constants/resource-target';


//Access resolver service class
@Injectable()
export class AccessResolverService {
  constructor(private readonly sharesRepository: SharesRepository) { }

  /*Method to resolve the effective AccessLevel for a user on a given resource (file or folder)*/
  async resolveAccess(resource: ResourceTarget, userId: string): Promise<AccessLevel | 'OWNER' | null> {
    const resourceOwnerId = resource.ownerId.toString();

    if (resourceOwnerId === userId) {
      return 'OWNER';
    }

    const itemsToQuery: { resourceType: 'FILE' | 'FOLDER'; resourceId: Types.ObjectId }[] = [
      {
        resourceType: resource.type,
        resourceId: new Types.ObjectId(resource.id),
      },
    ];

    if (resource.ancestors && resource.ancestors.length > 0) {
      for (const ancId of resource.ancestors) {
        itemsToQuery.push({
          resourceType: 'FOLDER',
          resourceId: new Types.ObjectId(ancId),
        });
      }
    }

    const matchingShares = await this.sharesRepository.findEffectiveSharesForResourceOrAncestors(
      itemsToQuery,
      userId,
    );

    if (matchingShares.length === 0) {
      return null;
    }

    let maxRank = 0;
    let maxAccess: AccessLevel = AccessLevel.VIEWER;

    for (const share of matchingShares) {
      const rank = ACCESS_LEVEL_RANK[share.access];
      if (rank > maxRank) {
        maxRank = rank;
        maxAccess = share.access;
      }
    }

    return maxAccess;
  }

  //Method to assert that the user has at least the required AccessLevel on the resource
  async assertAccess(resource: ResourceTarget, userId: string, minRequiredLevel: AccessLevel = AccessLevel.VIEWER, customErrorMessage = 'No tienes permisos para acceder a este recurso'): Promise<void> {
    const access = await this.resolveAccess(resource, userId);

    if (!access) {
      throw new AccessDeniedException(customErrorMessage);
    }

    if (access === 'OWNER') {
      return;
    }

    const currentRank = ACCESS_LEVEL_RANK[access];
    const requiredRank = ACCESS_LEVEL_RANK[minRequiredLevel];

    if (currentRank < requiredRank) {
      throw new AccessDeniedException(customErrorMessage);
    }
  }

  /* Method to assert that the user is the owner of the resource */
  assertOwner(
    ownerId: Types.ObjectId | string,
    userId: string,
    customErrorMessage = 'Solo el propietario puede realizar esta acción',
  ): void {
    if (ownerId.toString() !== userId) {
      throw new AccessDeniedException(customErrorMessage);
    }
  }
}
