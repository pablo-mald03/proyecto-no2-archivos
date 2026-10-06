import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { ActivityLogEntity, ActivityLogSchema } from './entities/activity-log.entity';
import { ActivityLogsRepository } from './repository/activity-logs.repository';
import { ActivityRecorderService } from './service/activity-recorder.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: ActivityLogEntity.name, schema: ActivityLogSchema }])],
  providers: [ActivityLogsRepository, ActivityRecorderService],
  exports: [ActivityRecorderService],
})
export class ActivityModule { }