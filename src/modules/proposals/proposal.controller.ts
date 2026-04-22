import { FastifyRequest, FastifyReply } from "fastify";
import { STATUS_CODES } from "@/shared/http/CONSTANTS.js";
import { successResponse } from "@/shared/http/response.utils.js";
import { ProposalService } from "./proposal.service.js";
import { PROPOSAL_MESSAGES } from "./constants/messages.js";
import { GenerateProposalDto, UpdateProposalDto } from "./types/index.js";

export class ProposalController {
  constructor(private readonly proposalService: ProposalService) {}

  async generate(
    request: FastifyRequest<{ Body: GenerateProposalDto }>,
    reply: FastifyReply,
  ): Promise<void> {
    const proposal = await this.proposalService.generate(request.user.id, request.body);
    reply.status(STATUS_CODES.CREATED).send(successResponse(proposal, PROPOSAL_MESSAGES.GENERATED));
  }

  async list(
    request: FastifyRequest<{ Querystring: { page?: number; pageSize?: number } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const page = request.query.page ?? 1;
    const pageSize = request.query.pageSize ?? 20;
    const result = await this.proposalService.getAll(request.user.id, page, pageSize);
    reply.status(STATUS_CODES.OK).send(successResponse(result, PROPOSAL_MESSAGES.FETCHED_ALL));
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const proposal = await this.proposalService.getById(request.user.id, request.params.id);
    reply.status(STATUS_CODES.OK).send(successResponse(proposal, PROPOSAL_MESSAGES.FETCHED_ONE));
  }

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateProposalDto }>,
    reply: FastifyReply,
  ): Promise<void> {
    const proposal = await this.proposalService.update(
      request.user.id,
      request.params.id,
      request.body,
    );
    reply.status(STATUS_CODES.OK).send(successResponse(proposal, PROPOSAL_MESSAGES.UPDATED));
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    await this.proposalService.delete(request.user.id, request.params.id);
    reply.status(STATUS_CODES.NO_CONTENT).send();
  }
}
