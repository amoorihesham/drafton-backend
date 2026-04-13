import { IAuthConfig } from "@/core/auth/config/auth.config.interface";
import { IJwtService, JwtPayload } from "@/core/auth/interfaces/services/jwt.service.interface";
import jwt from "jsonwebtoken";

export class JwtService implements IJwtService {
  constructor(private readonly config: IAuthConfig["jwt"]) {}
  generateAccessToken(payload: JwtPayload) {
    return jwt.sign(payload, this.config.jwtAccessSecret, { expiresIn: "15m" });
  }
  generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.config.jwtRefreshSecret, {
      expiresIn: this.config.refreshTokenExpiry,
    });
  }
  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, this.config.jwtAccessSecret) as JwtPayload;
  }
  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, this.config.jwtRefreshSecret) as JwtPayload;
  }
}
