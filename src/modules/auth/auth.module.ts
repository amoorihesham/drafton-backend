import { AuthConfig } from "./types";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { IMailService } from "@/shared/services/mail/mail.service.interface";
import { Database } from "@/db/connection";
import { AuthRepository } from "@/db/repositories/auth.repository";
import { Redis } from "@upstash/redis";
import { RefreshTokenStore } from "@/redis/refresh-token-store.service";

export const buildAuthModule = (
  db: Database,
  redis:Redis,
  mailService: IMailService,
  config: AuthConfig,
) => {
  const authRepository = new AuthRepository(db);
  const refreshTokenStore = new RefreshTokenStore(redis);
  const authService = new AuthService(authRepository, mailService,refreshTokenStore, config);
  return new AuthController(authService);
};
