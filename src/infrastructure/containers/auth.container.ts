import { Database } from "../db/connection.js";
import { AuthRepository } from "../db/repositories/auth.repository.js";
import { AuthService } from "../../core/auth/auth.service.js";
import { AuthController } from "../http/controllers/auth.controller.js";
import { IMailService } from "../../core/shared/interfaces/mail.service.interface.js";
import { IAuthConfig } from "../../core/auth/config/auth.config.interface.js";
import { Redis } from "@upstash/redis";
import { RefreshTokenStore } from "@/infrastructure/redis/refresh-token-store.service.js";
import { PasswordManager } from "../auth/password-manager/password-manager.service.js";
import { JwtService } from "../auth/jwt/jwt.service.js";
import { OtpService } from "../auth/otp/otp.service.js";

export function createAuthContainer(db: Database, redis: Redis, mailService: IMailService, config: IAuthConfig) {
  const authRepository = new AuthRepository(db);
  const passwordManager = new PasswordManager(config.hash);
  const refreshTokenStore = new RefreshTokenStore(redis);
  const jwtService = new JwtService(config.jwt);
  const otpService = new OtpService(config.otp);
  const authService = new AuthService(
    authRepository,
    passwordManager,
    refreshTokenStore,
    otpService,
    mailService,
    jwtService,
  );
  const authController = new AuthController(authService);

  return { authController };
}
