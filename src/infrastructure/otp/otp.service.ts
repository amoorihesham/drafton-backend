import { IOtpService } from "@/core/shared/interfaces/otp.service.interface";
import { randomInt } from "node:crypto";

export class OtpService implements IOtpService {
  generateOtp(expiryMinutes: number) {
    const otp = randomInt(0, 1_000_000).toString().padStart(6, "0");
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + expiryMinutes);
    return { otp, expiry };
  }

  verifyOtp({ userOtp, otp, expiry }: { userOtp: string; otp: string; expiry: Date }): boolean {
    return userOtp === otp && expiry > new Date();
  }
}
