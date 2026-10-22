import { IsMongoId, IsNotEmpty } from 'class-validator';
import { IntersectionType } from '@nestjs/mapped-types';
import { ReportSharesPaginatedQueryDto } from './report-shares-paginated-query.dto';

//Report shares query dto model
export class ReportSharesByUserQueryDto extends IntersectionType(
  ReportSharesPaginatedQueryDto,
) {
  @IsNotEmpty({ message: 'userId es requerido' })
  @IsMongoId({ message: 'userId debe ser un ObjectId válido' })
  userId!: string;
}
