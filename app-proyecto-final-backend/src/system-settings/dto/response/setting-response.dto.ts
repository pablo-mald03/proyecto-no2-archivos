//Principal setting response model dto class
export class SettingResponseDto {
  key!: string;
  value!: string | number;
  description!: string;
  updatedBy!: string | null;
  updatedAt!: Date;
}