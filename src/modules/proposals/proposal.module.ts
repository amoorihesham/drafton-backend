import { Database } from "@/db/connection.js";
import { ProposalRepository } from "@/db/repositories/proposal.repository.js";
import { IAnthropicService } from "@/shared/services/anthropic/anthropic.service.interface.js";
import { ProposalService } from "./proposal.service.js";
import { ProposalController } from "./proposal.controller.js";

export const buildProposalModule = (
  db: Database,
  anthropicService: IAnthropicService,
): ProposalController => {
  const proposalRepository = new ProposalRepository(db);
  const proposalService = new ProposalService(proposalRepository, anthropicService, db);
  return new ProposalController(proposalService);
};
