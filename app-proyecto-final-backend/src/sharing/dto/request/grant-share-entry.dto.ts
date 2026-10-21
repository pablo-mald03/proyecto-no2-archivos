import { IsEnum, IsOptional, Matches } from "class-validator";
import { AccessLevel } from "src/common/constants/permissions/access-level";
import { GranteeType } from "src/common/constants/permissions/grantee-type";
import { OBJECT_ID_REGEX } from "src/common/constants/regex/object-id";

/*Principal grant share entry dto model*/
export class GrantShareEntryDto {
    @IsEnum(GranteeType, { message: 'El granteeType debe ser USER o ANY_USER' })
    granteeType!: GranteeType;

    @IsOptional()
    @Matches(OBJECT_ID_REGEX, { message: 'El granteeId debe ser un ObjectId válido si granteeType es USER' })
    granteeId?: string | null;

    @IsEnum(AccessLevel, { message: 'El access debe ser VIEWER, COMMENTER o EDITOR' })
    access!: AccessLevel;
}