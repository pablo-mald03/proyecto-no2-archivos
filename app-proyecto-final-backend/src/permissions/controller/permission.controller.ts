import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RequirePermissions } from "src/common/decorators/require-permissions.decorator";
import { PermissionsService } from "../service/permission.service";
import { Permission } from "src/common/constants/permissions/permissions";
import { ListPermissionsQueryDto } from "../dto/request/list-permission-query.dto";
import { PaginatedPermissionResponseDto } from "../dto/response/permission-response.dto";


//Principal permission controller
@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissions: PermissionsService) { }

  //Endpoint to list all permissions
  @Get()
  @RequirePermissions(Permission.ROLES_VIEW)
  @ApiOperation({ summary: 'List permissions with pagination and filters' })
  @ApiOkResponse({ type: PaginatedPermissionResponseDto })
  findAll(@Query() query: ListPermissionsQueryDto) {
    return this.permissions.findAll(query);
  }

  //Endpoint to get all permissions catalog
  @Get('catalog')
  @RequirePermissions(Permission.ROLES_VIEW)
  @ApiOperation({ summary: 'Get the permission catalog grouped by module' })
  getCatalog() {
    return this.permissions.getCatalog();
  }
}