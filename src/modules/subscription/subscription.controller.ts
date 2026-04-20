import { FastifyRequest, FastifyReply } from "fastify";
import { SubscriptionService } from "./subscription.service.js";
import { STATUS_CODES } from "@/shared/http/CONSTANTS.js";
import { successResponse } from "@/shared/http/response.utils.js";
import { SUBSCRIPTION_MESSAGES } from "./constants/messages.js";
import { AdminCreateSubscriptionDto, AdminUpdateSubscriptionDto, SubscriptionStatus } from "./types/index.js";

export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async getAll(
    request: FastifyRequest<{ Querystring: { status?: SubscriptionStatus } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const subs = await this.subscriptionService.adminGetAll(request.query.status);
    reply.status(STATUS_CODES.OK).send(successResponse(subs, SUBSCRIPTION_MESSAGES.FETCHED_ALL));
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    const sub = await this.subscriptionService.adminGetById(request.params.id);
    reply.status(STATUS_CODES.OK).send(successResponse(sub, SUBSCRIPTION_MESSAGES.FETCHED_ONE));
  }

  async getByUser(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply): Promise<void> {
    const subs = await this.subscriptionService.adminGetByUserUuid(request.params.userId);
    reply.status(STATUS_CODES.OK).send(successResponse(subs, SUBSCRIPTION_MESSAGES.FETCHED_ALL));
  }

  async create(request: FastifyRequest<{ Body: AdminCreateSubscriptionDto }>, reply: FastifyReply): Promise<void> {
    const body = request.body;
    const sub = await this.subscriptionService.adminCreate({
      ...body,
      current_period_start: new Date(body.current_period_start as unknown as string),
      current_period_end: new Date(body.current_period_end as unknown as string),
      trial_ends_at: body.trial_ends_at ? new Date(body.trial_ends_at as unknown as string) : undefined,
    });
    reply.status(STATUS_CODES.CREATED).send(successResponse(sub, SUBSCRIPTION_MESSAGES.CREATED));
  }

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: AdminUpdateSubscriptionDto }>,
    reply: FastifyReply,
  ): Promise<void> {
    const body = request.body;
    const sub = await this.subscriptionService.adminUpdate(request.params.id, {
      ...body,
      current_period_end: body.current_period_end
        ? new Date(body.current_period_end as unknown as string)
        : undefined,
      trial_ends_at:
        body.trial_ends_at !== undefined
          ? body.trial_ends_at
            ? new Date(body.trial_ends_at as unknown as string)
            : null
          : undefined,
    });
    reply.status(STATUS_CODES.OK).send(successResponse(sub, SUBSCRIPTION_MESSAGES.UPDATED));
  }

  async cancel(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    const sub = await this.subscriptionService.adminCancel(request.params.id);
    reply.status(STATUS_CODES.OK).send(successResponse(sub, SUBSCRIPTION_MESSAGES.CANCELED));
  }
}
