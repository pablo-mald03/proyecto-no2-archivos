import { Injectable } from '@nestjs/common';
import { ActivityLogsRepository } from '../repository/activity-logs.repository';
import { PageResponseDto } from 'src/common/dto/page-response.dto';
import { ActivityLogResponseDto } from '../dto/response/activity-log-response.dto';
import { ListActivityQueryDto } from '../dto/request/list-activity-query.dto';
import { MyActivityQueryDto } from '../dto/request/my-activity-query.dto';
import { AuthUser } from 'src/users/models/auth-user.model';
import { ActivityCatalogResponseDto } from '../dto/response/activity-catalog-response.dto';
import { ACTIVITY_ACTION_LABELS, ActivityAction } from 'src/common/constants/actions/activity-action';
import { ResourceType } from 'src/common/constants/actions/resource-type';
import { RESOURCE_TYPE_LABELS } from 'src/common/constants/actions/resource-type-labels';
import { DRIVE_ACTIVITY_ACTIONS, DRIVE_RESOURCE_TYPES } from 'src/common/constants/actions/drive-activity-actions';
import { InvalidDateRangeException } from 'src/common/exceptions/invalid-date-range.exception';
import { ActivityLogMapper } from '../mapper/activity-log.mapper';

/*Principal activity service class*/
@Injectable()
export class ActivityService {
  constructor(private readonly logs: ActivityLogsRepository) {}

  /*Principal method to find all activity logs (Admin)*/
  findAll(query: ListActivityQueryDto): Promise<PageResponseDto<ActivityLogResponseDto>> {
    return this.search(query, query.actorId);
  }

  /*Principal method to find all drive activity logs of the authenticated user*/
  findMine(actor: AuthUser, query: MyActivityQueryDto): Promise<PageResponseDto<ActivityLogResponseDto>> {
    return this.searchDrive(query, actor.id);
  }

  /*Catalog for Drive users (only drive actions and resource types)*/
  getDriveCatalog(): ActivityCatalogResponseDto {
    return {
      actions: DRIVE_ACTIVITY_ACTIONS.map((code) => ({ code, label: ACTIVITY_ACTION_LABELS[code] })),
      resourceTypes: DRIVE_RESOURCE_TYPES.map((code) => ({ code, label: RESOURCE_TYPE_LABELS[code] })),
    };
  }

  /*Principal method to get all activity logs catalog (Admin)*/
  getCatalog(): ActivityCatalogResponseDto {
    return {
      actions: Object.values(ActivityAction).map((code) => ({ code, label: ACTIVITY_ACTION_LABELS[code] })),
      resourceTypes: Object.values(ResourceType).map((code) => ({ code, label: RESOURCE_TYPE_LABELS[code] })),
    };
  }

  //Method to search activity logs (Admin)
  private async search(query: MyActivityQueryDto, actorId?: string): Promise<PageResponseDto<ActivityLogResponseDto>> {
    if (query.from && query.to && query.from > query.to) throw new InvalidDateRangeException();

    const { content, total } = await this.logs.findPage(
      {
        actorId,
        action: query.action,
        resourceType: query.resourceType,
        resourceId: query.resourceId,
        from: query.from,
        to: query.to,
      },
      query,
    );

    return PageResponseDto.of(content.map(ActivityLogMapper.toResponse), total, query);
  }

  //Method to search drive-scoped activity logs (Excludes admin modules)
  private async searchDrive(
    query: MyActivityQueryDto,
    actorId: string,
  ): Promise<PageResponseDto<ActivityLogResponseDto>> {
    if (query.from && query.to && query.from > query.to) throw new InvalidDateRangeException();

    const { content, total } = await this.logs.findPage(
      {
        actorId,
        action: query.action,
        actionIn: query.action ? undefined : DRIVE_ACTIVITY_ACTIONS,
        resourceType: query.resourceType,
        resourceTypeIn: query.resourceType ? undefined : DRIVE_RESOURCE_TYPES,
        resourceId: query.resourceId,
        from: query.from,
        to: query.to,
      },
      query,
    );

    return PageResponseDto.of(content.map(ActivityLogMapper.toResponse), total, query);
  }
}