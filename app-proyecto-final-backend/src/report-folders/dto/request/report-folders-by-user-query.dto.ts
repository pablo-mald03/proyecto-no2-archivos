import { IsMongoId, IsNotEmpty } from 'class-validator';
import { IntersectionType } from '@nestjs/mapped-types';
import { ReportFoldersPaginatedQueryDto } from './report-folders-paginated-query.dto';

// Report folders by user query dto model
export class ReportFoldersByUserQueryDto extends IntersectionType(
  ReportFoldersPaginatedQueryDto,
) {
  @IsNotEmpty({ message: 'userId es requerido' })
  @IsMongoId({ message: 'userId debe ser un ObjectId válido' })
  userId!: string;
}
