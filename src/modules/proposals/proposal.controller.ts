import { FastifyRequest, FastifyReply } from "fastify";
import { STATUS_CODES } from "@/shared/http/CONSTANTS.js";
import { successResponse } from "@/shared/http/response.utils.js";
import { ProposalService } from "./proposal.service.js";
import { PROPOSAL_MESSAGES } from "./constants/messages.js";
import { CreateProposalType } from "./types/index.js";

export class ProposalController {
  constructor(private readonly proposalService: ProposalService) {}

  async generate(request: FastifyRequest<{ Body: CreateProposalType }>, reply: FastifyReply): Promise<void> {
    const proposal = await this.proposalService.generate(request.user.id, request.body);
    reply.status(STATUS_CODES.CREATED).send(successResponse(proposal, PROPOSAL_MESSAGES.GENERATED));
  }
}
