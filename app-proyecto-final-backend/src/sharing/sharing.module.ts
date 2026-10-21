import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShareEntity, ShareSchema } from './entities/share.entity';
import { SharesRepository } from './repository/shares.repository';
import { SharingService } from './service/sharing.service';
import { SharingController } from './controller/sharing.controller';
import { AccessResolverService } from './service/access-resolver.service';
import { FilesModule } from 'src/files/files.module';
import { FoldersModule } from 'src/folders/folders.module';
import { UsersModule } from 'src/users/users.module';
import { ActivityModule } from 'src/activity/activity.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ShareEntity.name, schema: ShareSchema }]),
    forwardRef(() => FilesModule),
    forwardRef(() => FoldersModule),
    UsersModule,
    ActivityModule,
  ],
  controllers: [SharingController],
  providers: [SharesRepository, SharingService, AccessResolverService],
  exports: [SharesRepository, AccessResolverService, SharingService],
})
export class SharingModule {}
