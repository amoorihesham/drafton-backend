import { FastifyRequest, FastifyReply } from "fastify";
import { AuthService } from "./auth.service";
import { STATUS_CODES } from "@/shared/http/CONSTANTS";
import { errorResponse, successResponse } from "@/shared/http/response.utils";
import { AUTH_ERROR_CODES, AUTH_MESSAGES } from "./constants/messages";
import { CreateUserDto, LoginDto, RefreshDto, VerifyEmailDto } from "./types";
import { AuthError } from "@/shared/errors/http.errors";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(
    request: FastifyRequest<{ Body: CreateUserDto }>,
    reply: FastifyReply,
  ): Promise<void> {
    const dto = request.body;
    const result = await this.authService.register(dto);
    reply
      .status(STATUS_CODES.CREATED)
      .send(successResponse(result, AUTH_MESSAGES.REGISTER_SUCCESS));
  }

  async login(
    request: FastifyRequest<{ Body: LoginDto }>,
    reply: FastifyReply,
  ): Promise<void> {
    const dto = request.body;
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
    reply
      .status(STATUS_CODES.OK)
      .send(successResponse(result, AUTH_MESSAGES.LOGIN_SUCCESS));
  }

  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {}

  async refresh(
    request: FastifyRequest<{
      Body: RefreshDto;
    }>,
    reply: FastifyReply,
  ) {
    const refresh_token = request.cookies?.refresh_token;
    const { deviceId } = request.body;
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
      .send(
        successResponse(
          { accessToken: result.accessToken },
          AUTH_MESSAGES.LOGIN_SUCCESS,
        ),
      );
  }

  async verifyEmail(
    request: FastifyRequest<{ Body: VerifyEmailDto }>,
    reply: FastifyReply,
  ): Promise<void> {
    const { email, otp } = request.body;
    const result = await this.authService.verifyEmail(email, otp);
    reply
      .status(STATUS_CODES.OK)
      .send(successResponse(result, AUTH_MESSAGES.VERIFY_EMAIL_SUCCESS));
  }
}
