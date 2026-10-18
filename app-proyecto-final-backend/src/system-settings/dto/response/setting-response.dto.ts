//Principal setting response model dto class
export class SettingResponseDto {
  key!: string;
  label!: string;
  category!: string;
  value!: string | number;
  description!: string;
  updatedBy!: string | null;
  updatedAt!: Date;
}