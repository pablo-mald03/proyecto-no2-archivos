import { IntersectionType } from '@nestjs/mapped-types';
import { ReportFoldersFilterDto } from './report-folders-filter.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

// Report folders paginated query dto model
export class ReportFoldersPaginatedQueryDto extends IntersectionType(
  PaginationQueryDto,
  ReportFoldersFilterDto,
) { }
