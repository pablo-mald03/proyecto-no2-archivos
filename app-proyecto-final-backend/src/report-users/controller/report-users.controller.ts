import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportUsersService } from '../service/report-users.service';
import { ReportUsersFilterDto } from '../dto/request/report-users-filter.dto';
import { ReportUsersPaginatedQueryDto } from '../dto/request/report-users-paginated-query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { Permission } from 'src/common/constants/permissions/permissions';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TopUserByFileCountDto } from '../dto/response/top-user-by-file-count.dto';
import { TopUserByStorageDto } from '../dto/response/top-user-by-storage.dto';
import { ApiPaginatedResponse } from 'src/common/decorators/api-paginated-response.decorator';
import { UserStoragePercentageDto } from '../dto/response/user-storage-percentage.dto';
import { UserShareCountDto } from '../dto/response/user-share-count.dto';

/* Principal controller for user-based reports */
@ApiTags('Report Users')
@Controller('reports/users')
@RequirePermissions(Permission.REPORTS_USERS_VIEW)
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportUsersController {
  constructor(private readonly reportUsersService: ReportUsersService) { }

  /*Endpoint to get the top 10 users with the most files.*/
  @ApiOperation({ summary: 'Get the top 10 users with the most files.' })
  @ApiOkResponse({
    type: TopUserByFileCountDto,
    isArray: true,
    description: 'Top 10 de usuarios con más archivos',
  })
  @Get('top-file-count')
  topByFileCount(@Query() filter: ReportUsersFilterDto) {
    return this.reportUsersService.topByFileCount(filter);
  }

  /*Endpoint to get the top 10 users with the most storage used.*/
  @ApiOperation({ summary: 'Get the top 10 users with the most storage used.' })
  @ApiOkResponse({
    type: TopUserByStorageDto,
    isArray: true,
    description: 'Top 10 de usuarios con mayor almacenamiento usado',
  })
  @Get('top-storage-used')
  topByStorageUsed(@Query() filter: ReportUsersFilterDto) {
    return this.reportUsersService.topByStorageUsed(filter);
  }

  /*Endpoint to get the storage percentage used by each user.*/
  @ApiOperation({ summary: 'Get the storage percentage used by each user.' })
  @ApiPaginatedResponse(UserStoragePercentageDto, 'Porcentaje de almacenamiento por usuario')
  @Get('storage-percentage')
  storagePercentagePage(@Query() query: ReportUsersPaginatedQueryDto) {
    return this.reportUsersService.storagePercentagePage(query);
  }

  /*Endpoint to get the share count of each user.*/
  @ApiOperation({ summary: 'Get the share count of each user.' })
  @ApiPaginatedResponse(UserShareCountDto, 'Conteo de recursos compartidos por usuario')
  @Get('share-count')
  shareCountPage(@Query() query: ReportUsersPaginatedQueryDto) {
    return this.reportUsersService.shareCountPage(query);
  }
}