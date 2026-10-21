import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportUsersService } from '../service/report-users.service';
import { ReportUsersFilterDto } from '../dto/request/report-users-filter.dto';
import { ReportUsersPaginatedQueryDto } from '../dto/request/report-users-paginated-query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { Permission } from 'src/common/constants/permissions/permissions';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

/* Principal controller for user-based reports */
@ApiTags('Report Users')
@Controller('reports/users')
@RequirePermissions(Permission.REPORTS_USERS_VIEW)
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportUsersController {
  constructor(private readonly reportUsersService: ReportUsersService) { }

  /*Endpoint to get the top 10 users with the most files.*/
  @ApiOperation({ summary: 'Get the top 10 users with the most files.' })
  @Get('top-file-count')
  topByFileCount(@Query() filter: ReportUsersFilterDto) {
    return this.reportUsersService.topByFileCount(filter);
  }

  /*Endpoint to get the top 10 users with the most storage used.*/
  @ApiOperation({ summary: 'Get the top 10 users with the most storage used.' })
  @Get('top-storage-used')
  topByStorageUsed(@Query() filter: ReportUsersFilterDto) {
    return this.reportUsersService.topByStorageUsed(filter);
  }

  /*Endpoint to get the storage percentage used by each user.*/
  @ApiOperation({ summary: 'Get the storage percentage used by each user.' })
  @Get('storage-percentage')
  storagePercentagePage(@Query() query: ReportUsersPaginatedQueryDto) {
    return this.reportUsersService.storagePercentagePage(query);
  }

  /*Endpoint to get the share count of each user.*/
  @ApiOperation({ summary: 'Get the share count of each user.' })
  @Get('share-count')
  shareCountPage(@Query() query: ReportUsersPaginatedQueryDto) {
    return this.reportUsersService.shareCountPage(query);
  }
}
