import { Controller, Get, Query } from '@nestjs/common';
import { ActivityService } from '../service/activity.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { Permission } from 'src/common/constants/permissions/permissions';
import { ListActivityQueryDto } from '../dto/request/list-activity-query.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/users/models/auth-user.model';
import { MyActivityQueryDto } from '../dto/request/my-activity-query.dto';
import { ActivityCatalogResponseDto } from '../dto/response/activity-catalog-response.dto';
import { PaginatedActivityLogResponseDto } from '../dto/response/activity-log-response.dto';

/*Principal activity controller*/
@ApiTags('Activity')
@Controller('activity')
export class ActivityController {
  constructor(private readonly activity: ActivityService) { }

  //Endpoint to list all activity logs 
  @Get()
  @RequirePermissions(Permission.ACTIVITY_VIEW_ALL)
  @ApiOperation({ summary: 'List all activity history with pagination and filters' })
  @ApiOkResponse({ type: PaginatedActivityLogResponseDto })
  findAll(@Query() query: ListActivityQueryDto) {
    return this.activity.findAll(query);
  }

  //Endpoint to list full activity logs of the authenticated user
  @Get('me')
  @RequirePermissions(Permission.DRIVE_ACCESS)
  @ApiOperation({ summary: 'List all activity history of the current user' })
  @ApiOkResponse({ type: PaginatedActivityLogResponseDto })
  findMine(@CurrentUser() actor: AuthUser, @Query() query: MyActivityQueryDto) {
    return this.activity.findMine(actor, query);
  }

  //Endpoint to get Drive catalog 
  @Get('drive/catalog')
  @RequirePermissions(Permission.DRIVE_ACCESS)
  @ApiOperation({ summary: 'Get Drive-only actions and resource types catalog' })
  @ApiOkResponse({ type: ActivityCatalogResponseDto })
  getDriveCatalog() {
    return this.activity.getDriveCatalog();
  }

  //Endpoint to get all activity logs catalog
  @Get('catalog')
  @ApiOperation({ summary: 'Get the actions and resource types available as filters' })
  getCatalog() {
    return this.activity.getCatalog();
  }
}