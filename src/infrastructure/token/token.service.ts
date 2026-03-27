import { randomInt } from "crypto";
import jwt from "jsonwebtoken";
import { ITokenService, JwtPayload } from "../../core/shared/interfaces/token.service.interface";
import { UnauthorizedException } from "../../core/shared/errors/http.errors";
import { TOKEN_ERROR_CODES, TOKEN_MESSAGES } from "./token.constants";

export interface TokenServiceConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiry: string;
  refreshExpiry: string;
}

export class TokenService implements ITokenService {
  constructor(private readonly config: TokenServiceConfig) {}

  generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.config.accessSecret, {
      expiresIn: this.config.accessExpiry as jwt.SignOptions["expiresIn"],
    });
  }

  generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.config.refreshSecret, {
      expiresIn: this.config.refreshExpiry as jwt.SignOptions["expiresIn"],
    });
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.config.accessSecret) as jwt.JwtPayload;
      return {
        sub: decoded.sub as string,
        email: decoded.email as string,
        role: decoded.role as string,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException(TOKEN_MESSAGES.ACCESS_TOKEN_EXPIRED, TOKEN_ERROR_CODES.ACCESS_TOKEN_EXPIRED);
      }
      throw new UnauthorizedException(TOKEN_MESSAGES.INVALID_ACCESS_TOKEN, TOKEN_ERROR_CODES.INVALID_ACCESS_TOKEN);
    }
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.config.refreshSecret) as jwt.JwtPayload;
      return {
        sub: decoded.sub as string,
        email: decoded.email as string,
        role: decoded.role as string,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException(TOKEN_MESSAGES.REFRESH_TOKEN_EXPIRED, TOKEN_ERROR_CODES.REFRESH_TOKEN_EXPIRED);
      }
      throw new UnauthorizedException(TOKEN_MESSAGES.INVALID_REFRESH_TOKEN, TOKEN_ERROR_CODES.INVALID_REFRESH_TOKEN);
    }
  }

  generateOtp(): string {
    // cryptographically secure 6-digit OTP
    return randomInt(100000, 999999).toString();
  }
}
