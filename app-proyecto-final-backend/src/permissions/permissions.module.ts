import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionEntity, PermissionSchema } from './entities/permission.entity';
import { PermissionsRepository } from './repository/permissions.repository';

//Principal permission module pipeline
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: PermissionEntity.name, schema: PermissionSchema },
        ]),
    ],
    providers: [PermissionsRepository],
    exports: [PermissionsRepository],
})
export class PermissionsModule { }
