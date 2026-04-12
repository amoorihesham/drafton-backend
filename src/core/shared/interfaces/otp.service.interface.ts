export interface IOtpService {
  generateOtp: (expiryMinutes: number) => { otp: string; expiry: Date };
  verifyOtp: ({ userOtp, otp, expiry }: { userOtp: string; otp: string; expiry: Date }) => boolean;
}
