
/*
 *Role user model to define the representation for the roles 
 * 
*/
export interface Role {
  id: string;
  code: string;
  name: string;
  description: string;
  isSystem: boolean;
  isActive: boolean;
  permissionsCount: number;
  createdAt: string;
}