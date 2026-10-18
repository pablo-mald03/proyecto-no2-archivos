import { FolderDocument, FolderEntity } from '../entities/folder.entity';
import { FolderBreadcrumbDto, FolderContentResponseDto } from '../dto/response/folder-content-response.dto';
import { FolderResponseDto } from '../dto/response/folder-response.dto';

export class FolderMapper {
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

  static toContentResponse(
    currentFolder: FolderDocument | null,
    breadcrumbs: FolderBreadcrumbDto[],
    folders: FolderDocument[],
    files: any[] = [],
  ): FolderContentResponseDto {
    return {
      currentFolder: currentFolder ? FolderMapper.toResponse(currentFolder) : null,
      breadcrumbs,
      folders: folders.map((f) => FolderMapper.toResponse(f)),
      files,
    };
  }
}
