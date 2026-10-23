import { FileDocument, FileEntity } from '../entities/file.entity';
import { FileResponseDto } from '../dto/response/file-response.dto';
import { ResourcePermissionsDto } from 'src/common/dto/resource-permissions.dto';

/*Principal file mapper class*/
export class FileMapper {

  //Method to map a file entity to domain model
  static toResponse(
    doc: FileDocument | FileEntity & { _id?: any },
    permissions?: ResourcePermissionsDto,
  ): FileResponseDto {
    const id = doc instanceof Object && '_id' in doc ? doc._id.toString() : (doc as any).id;
    return {
      id,
      ownerId: doc.ownerId.toString(),
      folderId: doc.folderId ? doc.folderId.toString() : null,
      name: doc.name,
      extension: doc.extension,
      mimeType: doc.mimeType,
      sizeBytes: doc.sizeBytes,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
      updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
      ...(permissions ? { permissions } : {}),
    };
  }
}

