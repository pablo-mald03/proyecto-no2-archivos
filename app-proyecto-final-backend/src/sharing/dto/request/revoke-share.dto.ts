import { IsEnum, IsOptional, Matches } from 'class-validator';
import { GranteeType } from 'src/common/constants/permissions/grantee-type';
import { OBJECT_ID_REGEX } from 'src/common/constants/regex/object-id';

/*Principal revoke share dto model*/
export class RevokeShareDto {
  @IsEnum(GranteeType, { message: 'El granteeType debe ser USER o ANY_USER' })
  granteeType!: GranteeType;

  @IsOptional()
  @Matches(OBJECT_ID_REGEX, { message: 'El granteeId debe ser un ObjectId válido si granteeType es USER' })
  granteeId?: string | null;
}
