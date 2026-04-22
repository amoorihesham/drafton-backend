import { FastifyInstance } from "fastify";
import { ProposalController } from "./proposal.controller.js";
import {
  deleteProposalSchema,
  generateProposalSchema,
  getProposalByIdSchema,
  listProposalsSchema,
  updateProposalSchema,
} from "./schemas/proposal.schema.js";
import { createAuthHook } from "@/shared/hooks/authenticate.js";

const PROPOSALS = ["Proposals"];
const AUTH = [{ cookieAuth: [] }];

export function proposalRoutes(proposalController: ProposalController, jwtSecret: string) {
  return async (fastify: FastifyInstance) => {
    fastify.addHook("preHandler", createAuthHook(jwtSecret));

    fastify.post(
      "/generate",
      {
        schema: {
          ...generateProposalSchema,
          tags: PROPOSALS,
          summary: "Generate a proposal via AI",
          security: AUTH,
        },
      },
      proposalController.generate.bind(proposalController),
    );

    fastify.get(
      "/",
      {
        schema: {
          ...listProposalsSchema,
          tags: PROPOSALS,
          summary: "List the current user's proposals",
          security: AUTH,
        },
      },
      proposalController.list.bind(proposalController),
    );

    fastify.get(
      "/:id",
      {
        schema: {
          ...getProposalByIdSchema,
          tags: PROPOSALS,
          summary: "Get a proposal by ID (full content)",
          security: AUTH,
        },
      },
      proposalController.getById.bind(proposalController),
    );

    fastify.patch(
      "/:id",
      {
        schema: {
          ...updateProposalSchema,
          tags: PROPOSALS,
          summary: "Update proposal title or content",
          security: AUTH,
        },
      },
      proposalController.update.bind(proposalController),
    );

    fastify.delete(
      "/:id",
      {
        schema: {
          ...deleteProposalSchema,
          tags: PROPOSALS,
          summary: "Delete a proposal",
          security: AUTH,
        },
      },
      proposalController.delete.bind(proposalController),
    );
  };
}
