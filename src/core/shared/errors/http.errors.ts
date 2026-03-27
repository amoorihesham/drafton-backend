import { AppError } from "./app.errors.js";

export class BadRequestException extends AppError {
  constructor(message = "Bad request", code = "BAD_REQUEST") {
    super(message, 400, code);
  }
}

export class UnauthorizedException extends AppError {
  constructor(message = "Unauthorized", code = "UNAUTHORIZED") {
    super(message, 401, code);
  }
}

export class ForbiddenException extends AppError {
  constructor(message = "Forbidden", code = "FORBIDDEN") {
    super(message, 403, code);
  }
}

export class NotFoundException extends AppError {
  constructor(message = "Resource not found", code = "NOT_FOUND") {
    super(message, 404, code);
  }
}

export class ConflictException extends AppError {
  constructor(message = "Conflict", code = "CONFLICT") {
    super(message, 409, code);
  }
}

export class InternalServerException extends AppError {
  constructor(message = "Internal server error", code = "INTERNAL_SERVER_ERROR") {
    super(message, 500, code);
  }
}
