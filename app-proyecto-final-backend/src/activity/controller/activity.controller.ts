import { Controller } from '@nestjs/common';
import { ActivityService } from '../service/activity.service';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) { }
}
