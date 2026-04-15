import { randomInt } from "crypto";

export function generateOtp(expiryTime: number) {
  const otp = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + expiryTime);
  return { otp, expiry };
}

export function verifyOtp({
  userOtp,
  otp,
  expiry,
}: {
  userOtp: string;
  otp: string;
  expiry: Date;
}): boolean {
  return userOtp === otp && expiry > new Date();
}
