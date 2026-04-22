import { ProposalContent } from "../schemas/block.schema.js";

export type ProposalStatus = "draft" | "generating" | "ready" | "failed";

export type ProposalDto = {
  id: string;
  title: string;
  status: ProposalStatus;
  prompt: string;
  content: ProposalContent;
  model: string;
  created_at: Date;
  updated_at: Date;
};

export type ProposalListItemDto = Omit<ProposalDto, "content" | "prompt">;

export type GenerateProposalDto = {
  prompt: string;
  title?: string;
};

export type UpdateProposalDto = Partial<{
  title: string;
  content: ProposalContent;
}>;

export type CreateProposalRow = {
  user_internal_id: number;
  title: string;
  prompt: string;
  content: ProposalContent;
  model: string;
  status: ProposalStatus;
};
