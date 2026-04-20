import { FastifyRequest, FastifyReply } from "fastify";
import { verifyJwtToken } from "@/modules/auth/utils/jwt.js";
import { UnauthorizedException } from "@/shared/errors/http.errors.js";
import { AUTH_ERROR_CODES } from "@/modules/auth/constants/messages.js";

export function createAuthHook(jwtSecret: string) {
  return async function authenticate(request: FastifyRequest, _reply: FastifyReply) {
    const token = request.cookies?.access_token;

    if (!token) {
      throw new UnauthorizedException("No access token provided", AUTH_ERROR_CODES.INVALID_ACCESS_TOKEN);
    }

    try {
      request.user = verifyJwtToken(token, jwtSecret);
    } catch {
      throw new UnauthorizedException("Invalid or expired access token", AUTH_ERROR_CODES.ACCESS_TOKEN_EXPIRED);
    }
  };
}
