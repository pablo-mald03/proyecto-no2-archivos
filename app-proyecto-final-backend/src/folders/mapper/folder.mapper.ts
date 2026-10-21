import { FolderDocument, FolderEntity } from '../entities/folder.entity';
import { FolderResponseDto } from '../dto/response/folder-response.dto';
import { FolderBreadcrumbDto } from '../dto/response/folder-breadcrum-response.dto';
import { FolderContentResponseDto } from '../dto/response/folder-content-response.dto';
import { FileResponseDto } from 'src/files/dto/response/file-response.dto';
import { PageResponseDto } from 'src/common/dto/page-response.dto';

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

  /*Principal mapper for paginated entities to domain content response DTO*/
  static toPaginatedContentResponse(
    currentFolder: FolderDocument | null,
    breadcrumbs: FolderBreadcrumbDto[],
    foldersPage: PageResponseDto<FolderResponseDto>,
    filesPage: PageResponseDto<FileResponseDto>,
  ): FolderContentResponseDto {
    return {
      currentFolder: currentFolder ? FolderMapper.toResponse(currentFolder) : null,
      breadcrumbs,
      folders: foldersPage,
      files: filesPage,
    };
  }
}
