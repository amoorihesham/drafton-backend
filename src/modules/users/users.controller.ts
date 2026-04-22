import { FastifyReply, FastifyRequest } from "fastify";
import { UsersService } from "./users.service";
import { STATUS_CODES } from "@/shared/http/CONSTANTS";
import { successResponse } from "@/shared/http/response.utils";

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  async findById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const user = await this.usersService.findById(request.params.id);
    reply.status(STATUS_CODES.OK).send(successResponse(user, "Data fetched successfully"));
  }

  async findByEmail(request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply) {
    const user = await this.usersService.findByEmail(request.body.email);
    reply.status(STATUS_CODES.OK).send(successResponse(user, "Data fetched successfully"));
  }

  async findUserWithSubscription(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const user = await this.usersService.findUserWithSubscription(request.params.id);
    reply.status(STATUS_CODES.OK).send(successResponse(user, "Data fetched successfully"));
  }
}
