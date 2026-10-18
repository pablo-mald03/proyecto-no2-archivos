import { Logger } from '@nestjs/common';
import type { SeedUser } from './data/dev-users.data';
import { UsersRepository } from 'src/users/repository/users.repository';
import { RolesRepository } from 'src/roles/repository/roles.repository';
import { PasswordService } from 'src/password/service/password.service';

//Principal class to create the users seeders
export class UsersSeeder {
    private readonly logger = new Logger(UsersSeeder.name);

    //Dependencies
    constructor(
        private readonly users: UsersRepository,
        private readonly roles: RolesRepository,
        private readonly passwords: PasswordService,
        private readonly defaultQuotaBytes: number,
    ) { }

    //Principal command to excecute the seed
    async run(seedUsers: readonly SeedUser[], plainPassword: string): Promise<void> {
        for (const seed of seedUsers) {
            if (await this.users.existsByEmailOrUsername(seed.email, seed.username)) {
                this.logger.log(`Skipped (already exists): ${seed.username}`);
                continue;
            }

            const role = await this.roles.findByCode(seed.roleCode);
            if (!role) {
                throw new Error(`Role ${seed.roleCode} not found: run the migrations first`);
            }

            await this.users.create({
                username: seed.username,
                email: seed.email,
                passwordHash: await this.passwords.hash(plainPassword),
                firstName: seed.firstName,
                lastName: seed.lastName,
                roleId: role._id,
                storage: { quotaBytes: this.defaultQuotaBytes, usedBytes: 0 },
            });

            this.logger.log(`Created: ${seed.username} (${seed.roleCode})`);
        }
    }
}