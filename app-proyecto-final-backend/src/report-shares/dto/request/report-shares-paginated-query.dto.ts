import { IntersectionType } from '@nestjs/mapped-types';
import { ReportSharesFilterDto } from './report-shares-filter.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

//Report shares paginated query dto model
export class ReportSharesPaginatedQueryDto extends IntersectionType(
  PaginationQueryDto,
  ReportSharesFilterDto,
) { }
