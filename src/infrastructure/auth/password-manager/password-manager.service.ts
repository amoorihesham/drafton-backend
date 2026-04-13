import bcrypt from "bcrypt";
import { IPasswordManager } from "@/core/auth/interfaces/services/password-manager.interface";
import { IAuthConfig } from "@/core/auth/config/auth.config.interface";

export class PasswordManager implements IPasswordManager {
  constructor(private readonly hashingConfig: IAuthConfig["hash"]) {}

  hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.hashingConfig.saltRounds);
  }

  compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
