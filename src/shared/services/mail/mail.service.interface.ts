export interface IMailService {
  sendVerificationEmail(email: string, otp: string): Promise<void>;
  sendPasswordResetEmail(email: string, otp: string): Promise<void>;
}
