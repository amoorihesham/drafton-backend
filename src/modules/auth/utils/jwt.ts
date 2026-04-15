import jwt from "jsonwebtoken";
import { JwtPayload } from "../types";

export function generateJwtToken(
  payload: JwtPayload,
  secret: string,
  expiry: number,
) {
  return jwt.sign(payload, secret, { expiresIn: expiry });
}

export function verifyJwtToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}
