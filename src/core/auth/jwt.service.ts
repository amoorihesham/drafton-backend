import { IJwtConfig } from "./config/auth.config.interface";
import { IJwtService, JwtPayload } from "./interfaces/jwt.service.interface";
import jwt from "jsonwebtoken";

export class JwtService implements IJwtService {
  constructor(private readonly config: IJwtConfig) {}
  generateAccessToken(payload: JwtPayload) {
    return jwt.sign(payload, this.config.jwtAccessSecret, { expiresIn: "15m" });
  }
  generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.config.jwtRefreshSecret, { expiresIn: "7d" });
  }
  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, this.config.jwtAccessSecret) as JwtPayload;
  }
  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, this.config.jwtRefreshSecret) as JwtPayload;
  }
}
