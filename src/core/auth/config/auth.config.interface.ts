export interface IAuthConfig {
  saltRounds: number;
  otpExpiryMinutes: number;
  resetOtpExpiryMinutes: number;
}
