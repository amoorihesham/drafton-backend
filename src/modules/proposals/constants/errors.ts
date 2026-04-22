import { AppError } from "@/shared/errors/app.errors.js";
import { PROPOSAL_ERROR_CODES, PROPOSAL_MESSAGES } from "./messages.js";

export class ProposalNotFoundError extends AppError {
  constructor() {
    super(PROPOSAL_MESSAGES.NOT_FOUND, 404, PROPOSAL_ERROR_CODES.NOT_FOUND);
  }
}

export class ProposalInProgressError extends AppError {
  constructor() {
    super(PROPOSAL_MESSAGES.ALREADY_GENERATING, 409, PROPOSAL_ERROR_CODES.IN_PROGRESS);
  }
}

export class AiGenerationError extends AppError {
  constructor(message: string = PROPOSAL_MESSAGES.AI_INVALID_OUTPUT) {
    super(message, 502, PROPOSAL_ERROR_CODES.AI_INVALID_OUTPUT);
  }
}

export class AiUnavailableError extends AppError {
  constructor(message: string = PROPOSAL_MESSAGES.AI_UNAVAILABLE) {
    super(message, 503, PROPOSAL_ERROR_CODES.AI_UNAVAILABLE);
  }
}
