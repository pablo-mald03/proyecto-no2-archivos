import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportFoldersService } from '../service/report-folders.service';
import { ReportFoldersPaginatedQueryDto } from '../dto/request/report-folders-paginated-query.dto';
import { ReportFoldersByUserQueryDto } from '../dto/request/report-folders-by-user-query.dto';
import { ReportFoldersByFolderQueryDto } from '../dto/request/report-folders-by-folder-query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { Permission } from 'src/common/constants/permissions/permissions';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/common/decorators/api-paginated-response.decorator';
import { FolderWithMostFilesDto } from '../dto/response/folder-with-most-files.dto';
import { UserRootFolderSpaceDto } from '../dto/response/user-root-folder-space.dto';
import { FolderContentReportItemDto } from '../dto/response/folder-content-report-item.dto';

// Principal controller for folder reports
@ApiTags('Report Folders')
@Controller('reports/folders')
@RequirePermissions(Permission.REPORTS_FOLDERS_VIEW)
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportFoldersController {
  constructor(private readonly reportFoldersService: ReportFoldersService) { }

  // Endpoint to get folders with the most files
  @ApiOperation({ summary: 'Get folders with the most files.' })
  @ApiPaginatedResponse(FolderWithMostFilesDto, 'Lista de carpetas con más archivos obtenida con éxito')
  @Get('most-files')
  foldersWithMostFilesPage(@Query() query: ReportFoldersPaginatedQueryDto) {
    return this.reportFoldersService.foldersWithMostFilesPage(query);
  }

  // Endpoint to get space used by root folders of a user
  @ApiOperation({ summary: 'Get space used by root folders of a user. Requires userId query param.' })
  @ApiPaginatedResponse(UserRootFolderSpaceDto, 'Lista del espacio utilizado por carpetas principales obtenida con éxito')
  @Get('user-root-folders-space')
  userRootFoldersSpacePage(@Query() query: ReportFoldersByUserQueryDto) {
    return this.reportFoldersService.userRootFoldersSpacePage(query);
  }

  // Endpoint to get contents of a folder and its subfolders
  @ApiOperation({ summary: 'Get contents of a selected folder and its subfolders. Requires folderId query param.' })
  @ApiPaginatedResponse(FolderContentReportItemDto, 'Contenido de la carpeta y sus subcarpetas obtenido con éxito')
  @Get('contents')
  folderContentsPage(@Query() query: ReportFoldersByFolderQueryDto) {
    return this.reportFoldersService.folderContentsPage(query);
  }
}
