import { FastifyRequest, FastifyReply } from "fastify";
import { AuthService } from "../../../core/auth/auth.service.js";
import { RegisterDto } from "../../../core/auth/dtos/register.dto.js";
import { successResponse } from "../../../core/shared/utils/response.utils.js";
import { AUTH_MESSAGES } from "../../../core/auth/constants/messages.js";
import { STATUS_CODES } from "../http.constans.js";
import { VerifyAccountDto } from "@/core/auth/dtos/verify-account.dto.js";
import { LoginDto } from "@/core/auth/dtos/login.dto.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dto = request.body as RegisterDto;
    const result = await this.authService.register(dto);
    reply.status(STATUS_CODES.CREATED).send(successResponse(result, AUTH_MESSAGES.REGISTER_SUCCESS));
  }

  async login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dto = request.body as LoginDto;
    const result = await this.authService.login(dto);
    reply.setCookie("access_token", result.accessToken!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    });
    reply.setCookie("refresh_token", result.refreshToken!, {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    });
    reply.status(STATUS_CODES.OK).send(successResponse(result, AUTH_MESSAGES.LOGIN_SUCCESS));
  }

  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {}

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const { refresh_token } = request.cookies;
    const { deviceId } = request.body as { deviceId: string };

    const result = await this.authService.refreshToken({
      deviceId,
      token: refresh_token!,
    });

    reply.setCookie("access_token", result.accessToken!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    });
    reply.setCookie("refresh_token", result.refreshToken!, {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    });
    reply
      .status(STATUS_CODES.OK)
      .send(successResponse({ accessToken: result.accessToken }, AUTH_MESSAGES.LOGIN_SUCCESS));
  }

  async verifyEmail(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dto = request.body as VerifyAccountDto;
    const result = await this.authService.verifyEmail(dto.email, dto.otp);
    reply.status(STATUS_CODES.OK).send(successResponse(result, AUTH_MESSAGES.VERIFY_EMAIL_SUCCESS));
  }
}
