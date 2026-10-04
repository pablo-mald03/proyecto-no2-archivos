import { Role } from "../role.model";

/*User pagination interface response */
export interface RolePage{

  content: Role[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}