import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

// Report folders filter dto model
export class ReportFoldersFilterDto {
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
}
