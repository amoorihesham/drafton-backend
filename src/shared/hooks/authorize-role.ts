import { FastifyRequest, FastifyReply } from "fastify";
import { ForbiddenException } from "@/shared/errors/http.errors.js";

type Role = "provider" | "client" | "admin";

export function createAuthorizeHook(...roles: Role[]) {
  return async function authorize(request: FastifyRequest, _reply: FastifyReply) {
    if (!roles.includes(request.user.role as Role)) {
      throw new ForbiddenException("Insufficient permissions");
    }
  };
}
