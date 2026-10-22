import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportSharesService } from '../service/report-shares.service';
import { ReportSharesPaginatedQueryDto } from '../dto/request/report-shares-paginated-query.dto';
import { ReportSharesByUserQueryDto } from '../dto/request/report-shares-by-user-query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { Permission } from 'src/common/constants/permissions/permissions';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/common/decorators/api-paginated-response.decorator';
import { MostSharedFileDto } from '../dto/response/most-shared-file.dto';
import { SharedByUserItemDto } from '../dto/response/shared-by-user-item.dto';
import { ReceivedByUserItemDto } from '../dto/response/received-by-user-item.dto';
import { NeverSharedFileDto } from '../dto/response/never-shared-file.dto';

// Report shares controller class
@ApiTags('Report Shares')
@Controller('reports/shares')
@RequirePermissions(Permission.REPORTS_SHARING_VIEW)
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportSharesController {
  constructor(private readonly reportSharesService: ReportSharesService) { }

  // Endpoint to get files shared with the most users
  @ApiOperation({ summary: 'Get files shared with the most users.' })
  @ApiPaginatedResponse(MostSharedFileDto, 'Lista de los archivos más compartidos obtenida con éxito')
  @Get('most-shared-files')
  mostSharedFilesPage(@Query() query: ReportSharesPaginatedQueryDto) {
    return this.reportSharesService.mostSharedFilesPage(query);
  }

  // Endpoint to get resources shared by a selected user
  @ApiOperation({ summary: 'Get resources shared by a selected user. Requires userId query param.' })
  @ApiPaginatedResponse(SharedByUserItemDto, 'Lista de recursos compartidos por el usuario obtenida con éxito')
  @Get('shared-by-user')
  sharedByUserPage(@Query() query: ReportSharesByUserQueryDto) {
    return this.reportSharesService.sharedByUserPage(query);
  }

  // Endpoint to get resources received by a selected user
  @ApiOperation({ summary: 'Get resources received by a selected user. Requires userId query param.' })
  @ApiPaginatedResponse(ReceivedByUserItemDto, 'Lista de recursos recibidos por el usuario obtenida con éxito')
  @Get('received-by-user')
  receivedByUserPage(@Query() query: ReportSharesByUserQueryDto) {
    return this.reportSharesService.receivedByUserPage(query);
  }

  // Endpoint to get files that have never been shared
  @ApiOperation({ summary: 'Get files that have never been shared.' })
  @ApiPaginatedResponse(NeverSharedFileDto, 'Lista de archivos nunca compartidos obtenida con éxito')
  @Get('never-shared-files')
  neverSharedFilesPage(@Query() query: ReportSharesPaginatedQueryDto) {
    return this.reportSharesService.neverSharedFilesPage(query);
  }
}