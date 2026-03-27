export const MAIL_ERROR_CODES = {
  INVALID_MAIL: "INVALID_MAIL",
  MAIL_EXPIRED: "MAIL_EXPIRED",
  MAIL_NOT_FOUND: "MAIL_NOT_FOUND",
  MAIL_ALREADY_VERIFIED: "MAIL_ALREADY_VERIFIED",
} as const;

export const MAIL_MESSAGES = {
  INVALID_MAIL: "Invalid mail.",
  MAIL_EXPIRED: "Mail expired.",
  MAIL_NOT_FOUND: "Mail not found.",
  MAIL_ALREADY_VERIFIED: "Mail already verified.",
} as const;
