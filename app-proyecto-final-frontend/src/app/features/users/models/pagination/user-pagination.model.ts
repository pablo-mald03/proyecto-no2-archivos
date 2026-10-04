import { User } from "../user.model";


/*User pagination interface response */
export interface UserPage{

  content: User[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}