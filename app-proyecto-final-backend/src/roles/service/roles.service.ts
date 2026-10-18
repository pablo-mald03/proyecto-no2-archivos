import { Injectable } from "@nestjs/common";
import { RolesRepository } from "../repository/roles.repository";
import { RoleDocument } from "../entities/role.entity";
import { RoleNotFoundException } from "../exceptions/role-not-found.exception";
import { Types } from "mongoose";
import { RoleInactiveException } from "../exceptions/role-inactive.exception";

/*Principal role service */
@Injectable()
export class RolesService {
  constructor(private readonly roles: RolesRepository) { }


  //Method to get the role by code
  async getByCodeOrFail(code: string): Promise<RoleDocument> {
    const role = await this.roles.findByCode(code);
    if (!role) throw new RoleNotFoundException();
    return role;
  }

  //Method to get the role by id
  async getByIdOrFail(id: Types.ObjectId | string): Promise<RoleDocument> {
    const role = await this.roles.findById(id);
    if (!role) throw new RoleNotFoundException();
    return role;
  }

  // Method to get all ids
  async getMapByIds(ids: string[]): Promise<Map<string, RoleDocument>> {
    const roles = await this.roles.findByIds(ids);
    return new Map(roles.map((r) => [r.id, r]));
  }

  // Method to verify the assignation for role that can be given to a user
  async getAssignableByCodeOrFail(code: string): Promise<RoleDocument> {
    const role = await this.getByCodeOrFail(code);
    if (!role.isActive) throw new RoleInactiveException();
    return role;
  }
}