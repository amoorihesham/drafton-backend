export const MAIL_ERRORS = {
  MAIL_SEND_FAILED: "MAIL_SEND_FAILED",
} as const;

export const MAIL_MESSAGES = {
  MAIL_SEND_FAILED: "Failed to send email. Please try again later.",
} as const;

export const MAIL_SUBJECTS = {
  VERIFICATION: "Verify your Drafton account",
  PASSWORD_RESET: "Reset your Drafton password",
} as const;

export const MAIL_OTP_EXPIRY_TEXT = {
  VERIFICATION: "10 minutes",
  PASSWORD_RESET: "60 minutes",
} as const;
