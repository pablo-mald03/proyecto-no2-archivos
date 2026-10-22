import { IsDateString, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

// Report shares filter dto model
export class ReportSharesFilterDto {
  @IsOptional()
  @IsDateString({}, { message: 'dateFrom debe ser una fecha ISO válida' })
  dateFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'dateTo debe ser una fecha ISO válida' })
  dateTo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsIn(['FILE', 'FOLDER'], { message: 'resourceType debe ser FILE o FOLDER' })
  resourceType?: 'FILE' | 'FOLDER';
}
