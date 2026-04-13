export interface IAuthConfig {
  hash: { saltRounds: number };
  jwt: {
    accessTokenExpiry: string;
    refreshTokenExpiry: number;
    jwtAccessSecret: string;
    jwtRefreshSecret: string;
  };
  otp: {
    verification_otp_expiry_time: number;
    reset_otp_expiry_time: number;
  };
}
