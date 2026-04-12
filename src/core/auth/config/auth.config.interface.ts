export interface IAuthConfig {
  saltRounds: number;
  otpExpiryMinutes: number;
  resetOtpExpiryMinutes: number;
}

export interface IJwtConfig {
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
}
