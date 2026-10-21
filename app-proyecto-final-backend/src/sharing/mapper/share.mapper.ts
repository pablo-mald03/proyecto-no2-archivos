import { ShareDocument, ShareEntity } from '../entities/share.entity';
import { ShareResponseDto } from '../dto/response/share-response.dto';

/*Principal share mapper class*/
export class ShareMapper {
  //Method to convert share to response dto
  static toResponse(
    doc: ShareDocument | ShareEntity & { _id?: any },
    granteeUser?: { email?: string; username?: string },
  ): ShareResponseDto {
    const id = doc instanceof Object && '_id' in doc ? doc._id.toString() : (doc as any).id;
    return {
      id,
      resourceType: doc.resourceType,
      resourceId: doc.resourceId.toString(),
      ownerId: doc.ownerId.toString(),
      granteeType: doc.granteeType,
      granteeId: doc.granteeId ? doc.granteeId.toString() : null,
      granteeEmail: granteeUser?.email || null,
      granteeUsername: granteeUser?.username || null,
      access: doc.access,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
      updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
    };
  }
}
