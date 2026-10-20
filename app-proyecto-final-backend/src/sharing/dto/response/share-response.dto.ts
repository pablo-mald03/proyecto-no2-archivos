import { AccessLevel } from 'src/common/constants/permissions/access-level';
import { GranteeType } from 'src/common/constants/permissions/grantee-type';

/*Principal share response dto model*/
export class ShareResponseDto {
  id!: string;
  resourceType!: 'FILE' | 'FOLDER';
  resourceId!: string;
  ownerId!: string;
  granteeType!: GranteeType;
  granteeId!: string | null;
  granteeEmail?: string | null;
  granteeUsername?: string | null;
  access!: AccessLevel;
  createdAt!: string;
  updatedAt!: string;
}
