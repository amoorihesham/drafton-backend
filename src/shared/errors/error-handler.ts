import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "./app.errors";
import { errorResponse } from "../http/response.utils";
import { STATUS_CODES } from "../http/CONSTANTS";

export function errorHandler(
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  // our own AppError — known, expected errors
  if (error instanceof AppError) {
    reply
      .status(error.statusCode)
      .send(errorResponse(error.code, error.message));
    return;
  }

  // Fastify validation error (malformed request body)
  if ("statusCode" in error && error.statusCode === STATUS_CODES.BAD_REQUEST) {
    reply
      .status(STATUS_CODES.BAD_REQUEST)
      .send(errorResponse("VALIDATION_ERROR", error.message));
    return;
  }

  // anything else is unexpected — log it, return generic message
  request.log.error(error);
  reply
    .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
    .send(errorResponse("INTERNAL_SERVER_ERROR", "Something went wrong"));
}
