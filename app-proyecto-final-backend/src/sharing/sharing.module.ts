import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShareEntity, ShareSchema } from './entities/share.entity';
import { SharesRepository } from './repository/shares.repository';
import { SharingService } from './sharing.service';
import { SharingController } from './sharing.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ShareEntity.name, schema: ShareSchema }]),
  ],
  controllers: [SharingController],
  providers: [SharesRepository, SharingService],
  exports: [SharesRepository],
})
export class SharingModule {}
