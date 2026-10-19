import { FolderDocument, FolderEntity } from '../entities/folder.entity';
import { FolderResponseDto } from '../dto/response/folder-response.dto';
import { FolderBreadcrumbDto } from '../dto/response/folder-breadcrum-response.dto';
import { FolderContentResponseDto } from '../dto/response/folder-content-response.dto';
import { FileResponseDto } from 'src/files/dto/response/file-response.dto';

/*Principal folder mapper class*/
export class FolderMapper {
  /*Principal mapper for Entity to domain*/
  static toResponse(doc: FolderDocument | FolderEntity & { _id?: any }): FolderResponseDto {
    const id = doc instanceof Object && '_id' in doc ? doc._id.toString() : (doc as any).id;
    return {
      id,
      ownerId: doc.ownerId.toString(),
      parentId: doc.parentId ? doc.parentId.toString() : null,
      name: doc.name,
      ancestors: (doc.ancestors || []).map((a) => a.toString()),
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
      updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
    };
  }

  /*Principal mapper for Entitys to domain DTOs*/
  static toContentResponse(currentFolder: FolderDocument | null,
    breadcrumbs: FolderBreadcrumbDto[],
    folders: FolderDocument[],
    files: FileResponseDto[] = []): FolderContentResponseDto {

    return {
      currentFolder: currentFolder ? FolderMapper.toResponse(currentFolder) : null,
      breadcrumbs,
      folders: folders.map((f) => FolderMapper.toResponse(f)),
      files,
    };
  }
}
