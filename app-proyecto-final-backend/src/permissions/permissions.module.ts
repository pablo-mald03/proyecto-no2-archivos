import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionEntity, PermissionSchema } from './entities/permission.entity';
import { PermissionsRepository } from './repository/permissions.repository';
import { PermissionsController } from './controller/permission.controller';
import { PermissionsService } from './service/permission.service';

//Principal permission module pipeline
@Module({
  imports: [MongooseModule.forFeature([{ name: PermissionEntity.name, schema: PermissionSchema }])],
  controllers: [PermissionsController],
  providers: [PermissionsRepository, PermissionsService],
  exports: [PermissionsService], 
})
export class PermissionsModule {}