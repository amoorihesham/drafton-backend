import { Database } from "../db/connection.js";
import { AuthRepository } from "../db/repositories/auth.repository.js";
import { AuthService } from "../../core/auth/auth.service.js";
import { AuthController } from "../http/controllers/auth.controller.js";
import { IJwtService } from "../../core/auth/interfaces/jwt.service.interface.js";
import { IMailService } from "../../core/shared/interfaces/mail.service.interface.js";
import { IAuthConfig } from "../../core/auth/config/auth.config.interface.js";
import { IOtpService } from "@/core/shared/interfaces/otp.service.interface.js";
import { Redis } from "@upstash/redis";
import { RefreshTokenStore } from "@/core/auth/refresh-token-store.service.js";

export function createAuthContainer(
  db: Database,
  redis: Redis,
  mailService: IMailService,
  otpService: IOtpService,
  jwtService: IJwtService,
  config: IAuthConfig,
) {
  const authRepository = new AuthRepository(db);
  const refreshTokenStore = new RefreshTokenStore(redis);
  const authService = new AuthService(
    authRepository,
    refreshTokenStore,
    otpService,
    mailService,
    jwtService,
    config,
  );
  const authController = new AuthController(authService);

  return { authController };
}
