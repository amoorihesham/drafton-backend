import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../core/shared/errors/app.error";
import { errorResponse } from "../../core/shared/utils/response.utils";

export function errorHandler(
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  // our own AppError — known, expected errors
  if (error instanceof AppError) {
    reply.status(error.statusCode).send(errorResponse(error.code, error.message));
    return;
  }

  // Fastify validation error (malformed request body)
  if ("statusCode" in error && error.statusCode === 400) {
    reply.status(400).send(errorResponse("VALIDATION_ERROR", error.message));
    return;
  }

  // anything else is unexpected — log it, return generic message
  request.log.error(error);
  reply.status(500).send(errorResponse("INTERNAL_SERVER_ERROR", "Something went wrong"));
}
