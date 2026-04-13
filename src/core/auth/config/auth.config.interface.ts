export interface IAuthConfig {
  saltRounds: number;
  otpExpiryMinutes: number;
  resetOtpExpiryMinutes: number;
}

export interface IJwtConfig {
  accessTokenExpiry: string;
  refreshTokenExpiry: number;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
}
