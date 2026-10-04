
/*
 *Role user model to define the representation for the roles 
 * 
*/
export interface Role {
  id: number;
  alias: string;
  name: string;
  description: string;
  active: boolean;
}