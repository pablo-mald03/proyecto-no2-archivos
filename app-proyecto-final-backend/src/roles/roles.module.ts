import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleEntity, RoleSchema } from './entities/role.entity';
import { PermissionEntity, PermissionSchema } from 'src/permissions/entities/permission.entity';
import { RolesRepository } from 'src/roles/repository/roles.repository';
import { PermissionsModule } from 'src/permissions/permissions.module';

@Module({

    imports: [
        MongooseModule.forFeature([
            { name: RoleEntity.name, schema: RoleSchema },
        ]),
        PermissionsModule,
    ],
    providers: [RolesRepository],
    exports: [RolesRepository],
})
export class RolesModule { }
