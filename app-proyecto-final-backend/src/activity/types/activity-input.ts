import { Types } from "mongoose";
import { ActivityAction } from "src/common/constants/actions/activity-action";
import { ResourceType } from "src/common/constants/actions/resource-type";
import { AuthUser } from "src/users/models/auth-user.model";
import { ActivityMetadataEntity } from "../entities/activity-metadata.entity";

//Activity entity input model
export interface ActivityInput {
    actor: Pick<AuthUser, 'id' | 'username' | 'email'>;
    action: ActivityAction;
    resource: { type: ResourceType; id: Types.ObjectId | string; name: string };
    description: string;
    target?: { id: Types.ObjectId | string; email: string };
    metadata?: ActivityMetadataEntity;
}