import { RoleEntity } from "../entities/role.entity";

/*Role info patch */
export type RoleInfoPatch = Partial<Pick<RoleEntity, 'name' | 'description'>>;
