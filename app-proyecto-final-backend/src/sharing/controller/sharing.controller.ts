import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { Permission } from 'src/common/constants/permissions/permissions';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/users/models/auth-user.model';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { SharingService } from '../service/sharing.service';
import { PaginatedSharedWithMeResponseDto, SharedWithMeItemDto } from '../dto/response/shared-with-me-item.dto';
import { ShareResponseDto } from '../dto/response/share-response.dto';
import { ShareResourceDto } from '../dto/request/share-resource.dto';
import { RevokeShareDto } from '../dto/request/revoke-share.dto';
import { ListSharedWithMeQueryDto } from '../dto/request/list-shared-with-me-query.dto';
import { PageResponseDto } from 'src/common/dto/page-response.dto';

/*Principal sharing controller class*/
@ApiTags('Sharing')
@Controller('shares')
@RequirePermissions(Permission.DRIVE_ACCESS)
export class SharingController {
  constructor(private readonly sharingService: SharingService) { }

  //Endpoint to list files and folders directly shared with me
  @Get('shared-with-me')
  @ApiOperation({ summary: 'List files and folders directly shared with the authenticated user with pagination and filters' })
  @ApiOkResponse({ type: PaginatedSharedWithMeResponseDto })
  getSharedWithMe(
    @CurrentUser() actor: AuthUser,
    @Query() query: ListSharedWithMeQueryDto,
  ): Promise<PageResponseDto<SharedWithMeItemDto>> {
    return this.sharingService.getSharedWithMe(actor, query);
  }

  //Endpoint to share a file
  @Post(':type/:id')
  @ApiOperation({ summary: 'Share a file' })
  @ApiOkResponse({ type: [ShareResponseDto] })
  shareResource(
    @Param('type') type: 'files' | 'folders',
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: ShareResourceDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<ShareResponseDto[]> {
    const resourceType = type === 'files' ? 'FILE' : 'FOLDER';
    return this.sharingService.shareResource(resourceType, id, dto, actor);
  }

  //Endpoint to list all direct shares on a file
  @Get(':type/:id')
  @ApiOperation({ summary: 'List all direct shares on a file' })
  @ApiOkResponse({ type: [ShareResponseDto] })
  getResourceShares(
    @Param('type') type: 'files' | 'folders',
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() actor: AuthUser,
  ): Promise<ShareResponseDto[]> {
    const resourceType = type === 'files' ? 'FILE' : 'FOLDER';
    return this.sharingService.getResourceShares(resourceType, id, actor);
  }

  //Endpoint to revoke share access
  @Delete(':type/:id')
  @ApiOperation({ summary: 'Revoke share access for a user or disable ANY_USER link' })
  revokeShare(
    @Param('type') type: 'files' | 'folders',
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: RevokeShareDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<void> {
    const resourceType = type === 'files' ? 'FILE' : 'FOLDER';
    return this.sharingService.revokeShare(resourceType, id, dto, actor);
  }
}
