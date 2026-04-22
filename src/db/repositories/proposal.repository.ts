import { Database } from "../connection.js";
import { proposals } from "../schema/index.js";
import { IProposalRepository } from "@/modules/proposals/interfaces/repository.interface.js";
import { CreateProposalRow } from "@/modules/proposals/types/index.js";

export class ProposalRepository implements IProposalRepository {
  constructor(private readonly db: Database) {}

  async create(row: CreateProposalRow) {
    return this.db
      .insert(proposals)
      .values({
        user_id: row.user_internal_id,
        title: row.title,
        prompt: row.prompt,
        content: row.content,
        model: row.model,
        status: row.status,
      })
      .returning();
  }
}
