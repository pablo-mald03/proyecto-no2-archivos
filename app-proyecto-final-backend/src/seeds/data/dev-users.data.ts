import { SystemRole } from '../../common/constants/system-roles';

//Seeder model
export interface SeedUser {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roleCode: string;
}

export const DEV_PASSWORD = 'admin1234';

//Constant for the seeder for users
export const DEV_USERS: readonly SeedUser[] = [
    {
        username: 'pablo-user',
        email: 'pablouser@gmail.com',
        firstName: 'Pablo',
        lastName: 'Usuario',
        roleCode: SystemRole.USER,
    },
];