import { Transform, Type } from "class-transformer";
import { IsDate, IsIn, IsOptional, Matches } from "class-validator";
import { ACTIVITY_SORT_FIELDS } from "src/activity/filters/activity-sort";
import { ActivityAction } from "src/common/constants/actions/activity-action";
import { ResourceType } from "src/common/constants/actions/resource-type";
import { OBJECT_ID_REGEX } from "src/common/constants/regex/object-id";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";
import { trimUpperCase } from "src/common/utils/transforms";


/*Principal model dto for the activity by user */
export class MyActivityQueryDto extends PaginationQueryDto {
  @IsIn(ACTIVITY_SORT_FIELDS, { message: 'El campo de ordenamiento no es válido' })
  sortBy: (typeof ACTIVITY_SORT_FIELDS)[number] = 'createdAt';

  @IsOptional() @Transform(trimUpperCase)
  @IsIn(Object.values(ActivityAction), { message: 'La acción no es válida' })
  action?: ActivityAction;

  @IsOptional() @Transform(trimUpperCase)
  @IsIn(Object.values(ResourceType), { message: 'El tipo de recurso no es válido' })
  resourceType?: ResourceType;

  @IsOptional()
  @Matches(OBJECT_ID_REGEX, { message: 'El identificador del recurso no es válido' })
  resourceId?: string;

  @IsOptional() @Type(() => Date)
  @IsDate({ message: 'La fecha inicial no es válida' })
  from?: Date;

  @IsOptional() @Type(() => Date)
  @IsDate({ message: 'La fecha final no es válida' })
  to?: Date;
}

