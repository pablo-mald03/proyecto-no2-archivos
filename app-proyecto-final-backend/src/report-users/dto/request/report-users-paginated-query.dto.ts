import { IntersectionType } from '@nestjs/mapped-types';
import { ReportUsersFilterDto } from './report-users-filter.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

/** Principal paginated query for user reports that support pagination */
export class ReportUsersPaginatedQueryDto extends IntersectionType(
  PaginationQueryDto,
  ReportUsersFilterDto,
) {}
