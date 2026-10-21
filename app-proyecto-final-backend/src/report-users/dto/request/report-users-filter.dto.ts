import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

/** Principal base filter shared across all user reports */
export class ReportUsersFilterDto {
  @IsOptional()
  @IsDateString({}, { message: 'dateFrom debe ser una fecha ISO válida' })
  dateFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'dateTo debe ser una fecha ISO válida' })
  dateTo?: string;

  /** Filter by username or email (partial match) */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
