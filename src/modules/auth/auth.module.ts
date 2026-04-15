import { AuthConfig } from "./types";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { IMailService } from "@/shared/services/mail/mail.service.interface";
import { Database } from "@/db/connection";
import { AuthRepository } from "@/db/repositories/auth.repository";

export const buildAuthModule = (
  db: Database,
  mailService: IMailService,
  config: AuthConfig,
) => {
  const authRepository = new AuthRepository(db);
  const authService = new AuthService(authRepository, mailService, config);
  return new AuthController(authService);
};
