export const PROPOSAL_MESSAGES = {
  FETCHED_ALL: "Proposals fetched successfully.",
  FETCHED_ONE: "Proposal fetched successfully.",
  GENERATED: "Proposal generated successfully.",
  UPDATED: "Proposal updated successfully.",
  DELETED: "Proposal deleted successfully.",
  NOT_FOUND: "Proposal not found.",
  ALREADY_GENERATING: "A proposal generation is already in progress.",
  AI_INVALID_OUTPUT: "AI returned an invalid proposal structure.",
  AI_UNAVAILABLE: "AI service is currently unavailable. Please try again.",
} as const;

export const PROPOSAL_ERROR_CODES = {
  NOT_FOUND: "PROPOSAL_NOT_FOUND",
  IN_PROGRESS: "PROPOSAL_IN_PROGRESS",
  AI_INVALID_OUTPUT: "AI_INVALID_OUTPUT",
  AI_UNAVAILABLE: "AI_UNAVAILABLE",
} as const;
