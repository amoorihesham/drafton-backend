export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: string;
}

export interface ITokenService {
  generateAccessToken(payload: JwtPayload): string;
  generateRefreshToken(payload: JwtPayload): string;
  verifyAccessToken(token: string): JwtPayload;
  verifyRefreshToken(token: string): JwtPayload;
  generateOpaqueToken(): string; // for verification and reset tokens
}
