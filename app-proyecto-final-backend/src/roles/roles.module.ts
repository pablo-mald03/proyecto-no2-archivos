import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleEntity, RoleSchema } from './entities/role.entity';
import { RolesRepository } from 'src/roles/repository/roles.repository';
import { RolesService } from './service/roles.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: RoleEntity.name, schema: RoleSchema }]),
    ],
    providers: [RolesRepository, RolesService],
    exports: [RolesRepository, RolesService],
})
export class RolesModule { }