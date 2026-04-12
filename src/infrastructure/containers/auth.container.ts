import { Database } from "../db/connection.js";
import { AuthRepository } from "../db/repositories/auth.repository.js";
import { AuthService } from "../../core/auth/auth.service.js";
import { AuthController } from "../http/controllers/auth.controller.js";
import { ITokenService } from "../../core/shared/interfaces/token.service.interface.js";
import { IMailService } from "../../core/shared/interfaces/mail.service.interface.js";
import { IAuthConfig } from "../../core/auth/config/auth.config.interface.js";
import { IOtpService } from "@/core/shared/interfaces/otp.service.interface.js";

export function createAuthContainer(
  db: Database,
  mailService: IMailService,
  otpService: IOtpService,
  config: IAuthConfig,
) {
  const authRepository = new AuthRepository(db);
  const authService = new AuthService(authRepository, otpService, mailService, config);
  const authController = new AuthController(authService);

  return { authController };
}
