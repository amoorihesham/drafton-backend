export interface IOtpService {
  generateVerficationOtp(): { otp: string; expiry: Date };
  generateResetPasswordOtp(): { otp: string; expiry: Date };
  verifyOtp({ userOtp, otp, expiry }: { userOtp: string; otp: string; expiry: Date }): boolean;
}
