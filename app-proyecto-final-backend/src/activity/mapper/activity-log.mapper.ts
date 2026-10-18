import { ActivityLogResponseDto } from "src/activity/dto/response/activity-log-response.dto";
import { ActivityLogView } from "src/activity/types/activity-log-view";
import { ACTIVITY_ACTION_LABELS } from "src/common/constants/actions/activity-action";
import { RESOURCE_TYPE_LABELS } from "src/common/constants/actions/resource-type-labels";
import { ActivityMetadataEntity } from "../entities/activity-metadata.entity";
import { ActivityMetadataResponseDto } from "../dto/response/activity-metadata-response.dto";
import { Types } from "mongoose";

/*Principal activity log mapper */
export class ActivityLogMapper {

  //Method to map ActivityLogView to ActivityLogResponseDto
  static toResponse(log: ActivityLogView): ActivityLogResponseDto {
    return {
      id: log._id.toString(),
      action: log.action,
      actionLabel: ActivityLogMapper.label(ACTIVITY_ACTION_LABELS, log.action),
      description: log.description,
      resourceType: log.resourceType,
      resourceTypeLabel: ActivityLogMapper.label(RESOURCE_TYPE_LABELS, log.resourceType),
      resourceId: log.resourceId.toString(),
      resourceName: log.resourceName,
      actorId: log.actorId.toString(),
      actorUsername: log.actorUsername,
      actorEmail: log.actorEmail,
      targetUserId: log.targetUserId?.toString() ?? null,
      targetUserEmail: log.targetUserEmail ?? null,
      metadata: ActivityLogMapper.toMetadata(log.metadata),
      createdAt: log.createdAt,
    };
  }

  //Method to map ActivityMetadataEntity to ActivityMetadataResponseDto
  private static toMetadata(m?: ActivityMetadataEntity): ActivityMetadataResponseDto | null {
    if (!m) return null;
    return {
      previousName: m.previousName,
      fromFolderId: ActivityLogMapper.id(m.fromFolderId),
      toFolderId: ActivityLogMapper.id(m.toFolderId),
      accessLevel: m.accessLevel,
      previousAccessLevel: m.previousAccessLevel,
      granteeType: m.granteeType,
      sizeBytes: m.sizeBytes,
      previousSizeBytes: m.previousSizeBytes,
    };
  }

  //Method to map Types.ObjectId to string
  private static id(v?: Types.ObjectId | null): string | null | undefined {
    return v === undefined || v === null ? v : v.toString();
  }

  //Method to get the label of an action or resource type
  private static label(labels: Record<string, string>, code: string): string {
    return labels[code] ?? code;
  }
}