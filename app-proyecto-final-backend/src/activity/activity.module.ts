import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { ActivityLogEntity, ActivityLogSchema } from './entities/activity-log.entity';
import { ActivityLogsRepository } from './repository/activity-logs.repository';
import { ActivityRecorderService } from './service/activity-recorder.service';
import { ActivityService } from './service/activity.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: ActivityLogEntity.name, schema: ActivityLogSchema }])],
  providers: [ActivityLogsRepository, ActivityRecorderService, ActivityService],
  exports: [ActivityRecorderService,ActivityService],
})
export class ActivityModule { }