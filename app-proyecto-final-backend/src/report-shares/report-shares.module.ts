import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportSharesService } from './service/report-shares.service';
import { ReportSharesController } from './controller/report-shares.controller';
import { ReportSharesRepository } from './repository/report-shares.repository';
import { FileEntity, FileSchema } from 'src/files/entities/file.entity';
import { ShareEntity, ShareSchema } from 'src/sharing/entities/share.entity';

/* Principal module for share reports */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FileEntity.name, schema: FileSchema },
      { name: ShareEntity.name, schema: ShareSchema },
    ]),
  ],
  controllers: [ReportSharesController],
  providers: [ReportSharesService, ReportSharesRepository],
})
export class ReportSharesModule { }
