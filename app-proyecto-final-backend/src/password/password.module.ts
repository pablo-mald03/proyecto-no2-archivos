import { Module } from "@nestjs/common";
import { PasswordService } from "./service/password.service";


@Module({ providers: [PasswordService], exports: [PasswordService] })
export class PasswordModule {}