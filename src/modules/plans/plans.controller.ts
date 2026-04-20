import { FastifyRequest, FastifyReply } from "fastify";
import { PlanService } from "./plans.service.js";
import { STATUS_CODES } from "@/shared/http/CONSTANTS.js";
import { successResponse } from "@/shared/http/response.utils.js";
import { PLAN_MESSAGES } from "./constants/messages.js";
import { CreatePlanDto, UpdatePlanDto } from "./types/index.js";

export class PlanController {
  constructor(private readonly planService: PlanService) {}

  async getAll(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const plans = await this.planService.getAll();
    reply.status(STATUS_CODES.OK).send(successResponse(plans, PLAN_MESSAGES.FETCHED_ALL));
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    const plan = await this.planService.getById(request.params.id);
    reply.status(STATUS_CODES.OK).send(successResponse(plan, PLAN_MESSAGES.FETCHED_ONE));
  }

  async create(request: FastifyRequest<{ Body: CreatePlanDto }>, reply: FastifyReply): Promise<void> {
    const plan = await this.planService.create(request.body);
    reply.status(STATUS_CODES.CREATED).send(successResponse(plan, PLAN_MESSAGES.CREATED));
  }

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdatePlanDto }>,
    reply: FastifyReply,
  ): Promise<void> {
    const plan = await this.planService.update(request.params.id, request.body);
    reply.status(STATUS_CODES.OK).send(successResponse(plan, PLAN_MESSAGES.UPDATED));
  }

  async deactivate(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    const plan = await this.planService.deactivate(request.params.id);
    reply.status(STATUS_CODES.OK).send(successResponse(plan, PLAN_MESSAGES.DEACTIVATED));
  }
}
