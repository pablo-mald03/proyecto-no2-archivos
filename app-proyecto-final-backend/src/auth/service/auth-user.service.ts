import { Injectable, Logger } from "@nestjs/common";
import { AuthenticationException } from "src/common/exceptions/authentication.exception";
import { RolesRepository } from "src/roles/repository/roles.repository";
import { UserDocument } from "src/users/entities/user.entity";
import { AuthUser } from "src/users/models/auth-user.model";


//Principal auth user service
@Injectable()
export class AuthUserService {
    private readonly logger = new Logger(AuthUserService.name);

    constructor(private readonly roles: RolesRepository) { }

    //Principal method to get the user pipe
    async fromUser(user: UserDocument): Promise<AuthUser> {
        const role = await this.roles.findById(user.roleId);
        if (!role) {
            this.logger.error(`User ${user.id} references a missing role ${user.roleId.toString()}`);
            throw new AuthenticationException();
        }

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            roleCode: role.code,
            permissions: [...role.permissions],
        };
    }
}