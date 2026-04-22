import { AiProposalContent } from "@/modules/proposals/schemas/block.schema.js";

export type GenerateProposalInput = {
  prompt: string;
  signal?: AbortSignal;
};

export type GenerateProposalOutput = {
  content: AiProposalContent;
  model: string;
};

export interface IAnthropicService {
  generateProposal(input: GenerateProposalInput): Promise<GenerateProposalOutput>;
}
