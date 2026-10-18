import { UserEntity } from "../entities/user.entity";

//Principal type for the profile filter
export type UserProfilePatch = Partial<Pick<UserEntity, 'username' | 'email' | 'firstName' | 'lastName'>>;