import { Injectable, Logger } from '@nestjs/common';
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
import { InvalidDateRangeException } from 'src/common/exceptions/invalid-date-range.exception';
import { ActivityLogMapper } from '../mapper/activity-log.mapper';

@Injectable()
export class ActivityService {
  constructor(private readonly logs: ActivityLogsRepository) { }


  /*Principal method to find all activity logs*/
  findAll(query: ListActivityQueryDto): Promise<PageResponseDto<ActivityLogResponseDto>> {
    return this.search(query, query.actorId);
  }

  /*Principal method to find all activity logs of the authenticated user*/
  findMine(actor: AuthUser, query: MyActivityQueryDto): Promise<PageResponseDto<ActivityLogResponseDto>> {
    return this.search(query, actor.id);
  }


  /*Principal method to get all activity logs catalog*/
  getCatalog(): ActivityCatalogResponseDto {
    return {
      actions: Object.values(ActivityAction).map((code) => ({ code, label: ACTIVITY_ACTION_LABELS[code] })),
      resourceTypes: Object.values(ResourceType).map((code) => ({ code, label: RESOURCE_TYPE_LABELS[code] })),
    };
  }

  //Method to search activity logs
  private async search(query: MyActivityQueryDto, actorId?: string): Promise<PageResponseDto<ActivityLogResponseDto>> {
    if (query.from && query.to && query.from > query.to) throw new InvalidDateRangeException();

    const { content, total } = await this.logs.findPage({
      actorId,
      action: query.action,
      resourceType: query.resourceType,
      resourceId: query.resourceId,
      from: query.from,
      to: query.to,
    }, query);

    return PageResponseDto.of(content.map(ActivityLogMapper.toResponse), total, query);
  }
}