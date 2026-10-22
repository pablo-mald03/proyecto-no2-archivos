import { IsMongoId, IsNotEmpty } from 'class-validator';
import { IntersectionType } from '@nestjs/mapped-types';
import { ReportFoldersPaginatedQueryDto } from './report-folders-paginated-query.dto';

// Report folders by folder query dto model
export class ReportFoldersByFolderQueryDto extends IntersectionType(
  ReportFoldersPaginatedQueryDto,
) {
  @IsNotEmpty({ message: 'folderId es requerido' })
  @IsMongoId({ message: 'folderId debe ser un ObjectId válido' })
  folderId!: string;
}
