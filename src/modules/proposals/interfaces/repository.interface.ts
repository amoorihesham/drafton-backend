import { proposals } from "@/db/schema/proposal.schema.js";

export interface IProposalRepository {
  create(row: CreateProposalRow): Promise<(typeof proposals.$inferSelect)[]>;
}
