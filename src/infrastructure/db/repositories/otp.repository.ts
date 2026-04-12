import { IOtpRepository } from "@/core/auth/interfaces/otp.repository.interface";
import { randomInt } from "crypto";

export const OtpRepository: IOtpRepository = {
  generateOtp: async () => {
    return randomInt(0, 1_000_000).toString().padStart(6, "0");
  },
  verifyOtp: async (otpTimestamp: number) => {
    return otpTimestamp > Date.now();
  },
  clearOtp: async (userId: string) => {
    return;
  },


  
 
};
