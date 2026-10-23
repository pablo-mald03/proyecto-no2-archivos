import { LogMetadata } from "./response/log-metadata.model";

/*Principal log interface base representation */
export interface Log {
  id: string;
  action: string;
  actionLabel: string;
  description: string;
  resourceType: string;
  resourceTypeLabel: string;
  resourceId?: string;
  resourceName?: string;
  actorId?: string;
  actorUsername?: string;
  actorEmail?: string;
  targetUserId?: string;
  targetUserEmail?: string;
  metadata?: LogMetadata;
  createdAt: string;
}