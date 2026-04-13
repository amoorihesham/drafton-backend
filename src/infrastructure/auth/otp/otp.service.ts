import { IAuthConfig } from "@/core/auth/config/auth.config.interface";
import { IOtpService } from "@/core/auth/interfaces/services/otp.service.interface";
import { randomInt } from "node:crypto";

export class OtpService implements IOtpService {
  constructor(private readonly config: IAuthConfig["otp"]) {}
  generateVerficationOtp() {
    const otp = randomInt(0, 1_000_000).toString().padStart(6, "0");
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + this.config.verification_otp_expiry_time);
    return { otp, expiry };
  }

  generateResetPasswordOtp() {
    const otp = randomInt(0, 1_000_000).toString().padStart(6, "0");
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + this.config.reset_otp_expiry_time);
    return { otp, expiry };
  }

  verifyOtp({ userOtp, otp, expiry }: { userOtp: string; otp: string; expiry: Date }): boolean {
    return userOtp === otp && expiry > new Date();
  }
}
