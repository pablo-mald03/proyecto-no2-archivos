import { SystemRole } from '../../common/constants/validation/system-roles';

//Seeder model
export interface SeedUser {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roleCode: string;
}

export const DEV_PASSWORD = 'admin1234';

//Constant for the 8 initial users
export const DEV_USERS: readonly SeedUser[] = [
  {
    username: 'pablo-user',
    email: 'pablouser@gmail.com',
    firstName: 'Pablo',
    lastName: 'Maldonado',
    roleCode: SystemRole.USER,
  },
  {
    username: 'carlos-dev',
    email: 'carlos.dev@gmail.com',
    firstName: 'Carlos',
    lastName: 'Gomez',
    roleCode: SystemRole.USER,
  },
  {
    username: 'maria-designer',
    email: 'maria.design@gmail.com',
    firstName: 'Maria',
    lastName: 'Lopez',
    roleCode: SystemRole.USER,
  },
  {
    username: 'ana-analyst',
    email: 'ana.analyst@gmail.com',
    firstName: 'Ana',
    lastName: 'Morales',
    roleCode: SystemRole.USER,
  },
  {
    username: 'david-qa',
    email: 'david.qa@gmail.com',
    firstName: 'David',
    lastName: 'Castillo',
    roleCode: SystemRole.USER,
  },
  {
    username: 'elena-pm',
    email: 'elena.pm@gmail.com',
    firstName: 'Elena',
    lastName: 'Rios',
    roleCode: SystemRole.USER,
  },
  {
    username: 'roberto-arch',
    email: 'roberto.arch@gmail.com',
    firstName: 'Roberto',
    lastName: 'Vargas',
    roleCode: SystemRole.USER,
  },
  {
    username: 'lucia-writer',
    email: 'lucia.writer@gmail.com',
    firstName: 'Lucia',
    lastName: 'Perez',
    roleCode: SystemRole.USER,
  },
];