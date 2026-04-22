import { Type } from "@sinclair/typebox";
import { successResponse } from "@/shared/http/response.utils.js";
import { ProposalContentSchema } from "./block.schema.js";

const StatusSchema = Type.Union([
  Type.Literal("draft"),
  Type.Literal("generating"),
  Type.Literal("ready"),
  Type.Literal("failed"),
]);

const ProposalFullSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  title: Type.String(),
  status: StatusSchema,
  prompt: Type.String(),
  content: ProposalContentSchema,
  model: Type.String(),
  created_at: Type.String(),
  updated_at: Type.String(),
});

const ProposalListItemSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  title: Type.String(),
  status: StatusSchema,
  model: Type.String(),
  created_at: Type.String(),
  updated_at: Type.String(),
});

export const generateProposalSchema = {
  body: Type.Object({
    prompt: Type.String({ minLength: 10, maxLength: 10_000 }),
    title: Type.Optional(Type.String({ minLength: 1, maxLength: 200 })),
  }),
  response: { 201: successResponse(ProposalFullSchema) },
};

export const listProposalsSchema = {
  querystring: Type.Object({
    page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    pageSize: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20 })),
  }),
  response: {
    200: successResponse(
      Type.Object({
        items: Type.Array(ProposalListItemSchema),
        total: Type.Integer(),
        page: Type.Integer(),
        pageSize: Type.Integer(),
      }),
    ),
  },
};

export const getProposalByIdSchema = {
  params: Type.Object({ id: Type.String({ format: "uuid" }) }),
  response: { 200: successResponse(ProposalFullSchema) },
};

export const updateProposalSchema = {
  params: Type.Object({ id: Type.String({ format: "uuid" }) }),
  body: Type.Object({
    title: Type.Optional(Type.String({ minLength: 1, maxLength: 200 })),
    content: Type.Optional(ProposalContentSchema),
  }),
  response: { 200: successResponse(ProposalFullSchema) },
};

export const deleteProposalSchema = {
  params: Type.Object({ id: Type.String({ format: "uuid" }) }),
  response: { 204: Type.Null() },
};
