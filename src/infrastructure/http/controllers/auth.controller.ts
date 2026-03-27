import { FastifyRequest, FastifyReply } from "fastify";
import { AuthService } from "../../../core/auth/auth.service.js";
import { RegisterDto } from "../../../core/auth/dtos/register.dto.js";
import { successResponse } from "../../../core/shared/utils/response.utils.js";
import { AUTH_MESSAGES } from "../../../core/auth/auth.constants.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dto = request.body as RegisterDto;
    const result = await this.authService.register(dto);
    reply.status(201).send(successResponse(result, AUTH_MESSAGES.REGISTER_SUCCESS));
  }
}
