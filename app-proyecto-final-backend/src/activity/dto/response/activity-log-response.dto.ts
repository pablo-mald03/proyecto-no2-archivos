import { PageResponseDto } from "src/common/dto/page-response.dto";
import { ActivityMetadataResponseDto } from "./activity-metadata-response.dto";
import { ApiProperty } from "@nestjs/swagger";

//Principal activity log response dto model
export class ActivityLogResponseDto {
  id!: string;
  action!: string;
  actionLabel!: string;
  description!: string;
  resourceType!: string;
  resourceTypeLabel!: string;
  resourceId!: string;
  resourceName!: string;
  actorId!: string;
  actorUsername!: string;
  actorEmail!: string;
  targetUserId!: string | null;
  targetUserEmail!: string | null;
  metadata!: ActivityMetadataResponseDto | null;
  createdAt!: Date;
}


export class PaginatedActivityLogResponseDto extends PageResponseDto<ActivityLogResponseDto> {
  @ApiProperty({ type: [ActivityLogResponseDto] })
  declare content: ActivityLogResponseDto[];
}
