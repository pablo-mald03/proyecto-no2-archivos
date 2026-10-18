import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleEntity, RoleSchema } from './entities/role.entity';
import { RolesRepository } from 'src/roles/repository/roles.repository';
import { RolesService } from './service/roles.service';
import { RolesController } from './controller/role.controller';
import { RolesAdminService } from './service/role-admin.service';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { UsersModule } from 'src/users/users.module';
import { ActivityModule } from 'src/activity/activity.module';

@Module({
   imports: [
        MongooseModule.forFeature([{ name: RoleEntity.name, schema: RoleSchema }]),
        PermissionsModule, 
        ActivityModule,
        forwardRef(() => UsersModule),
    ],
    controllers: [RolesController],
    providers: [RolesRepository, RolesService, RolesAdminService], 
    exports: [RolesRepository, RolesService],
})
export class RolesModule { }