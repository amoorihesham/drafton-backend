import { and, desc, eq, sql } from "drizzle-orm";
import { Database } from "../connection.js";
import { proposals, users } from "../schema/index.js";
import { IProposalRepository } from "@/modules/proposals/interfaces/repository.interface.js";
import {
  CreateProposalRow,
  ProposalDto,
  ProposalListItemDto,
  UpdateProposalDto,
} from "@/modules/proposals/types/index.js";
import { ProposalContent } from "@/modules/proposals/schemas/block.schema.js";

const dtoColumns = {
  id: proposals.id,
  title: proposals.title,
  status: proposals.status,
  prompt: proposals.prompt,
  content: proposals.content,
  model: proposals.model,
  created_at: proposals.created_at,
  updated_at: proposals.updated_at,
};

const listColumns = {
  id: proposals.id,
  title: proposals.title,
  status: proposals.status,
  model: proposals.model,
  created_at: proposals.created_at,
  updated_at: proposals.updated_at,
};

function toDto(row: typeof dtoColumns extends infer _ ? Record<string, unknown> : never): ProposalDto {
  return {
    id: row.id as string,
    title: row.title as string,
    status: row.status as ProposalDto["status"],
    prompt: row.prompt as string,
    content: row.content as ProposalContent,
    model: row.model as string,
    created_at: row.created_at as Date,
    updated_at: row.updated_at as Date,
  };
}

export class ProposalRepository implements IProposalRepository {
  constructor(private readonly db: Database) {}

  async create(row: CreateProposalRow): Promise<ProposalDto> {
    const [inserted] = await this.db
      .insert(proposals)
      .values({
        user_id: row.user_internal_id,
        title: row.title,
        prompt: row.prompt,
        content: row.content,
        model: row.model,
        status: row.status,
      })
      .returning(dtoColumns);

    return toDto(inserted as unknown as Record<string, unknown>);
  }

  async findByIdForUser(id: string, userUuid: string): Promise<ProposalDto | undefined> {
    const [row] = await this.db
      .select(dtoColumns)
      .from(proposals)
      .innerJoin(users, eq(users.internal_id, proposals.user_id))
      .where(and(eq(proposals.id, id), eq(users.id, userUuid)))
      .limit(1);

    return row ? toDto(row as unknown as Record<string, unknown>) : undefined;
  }

  async findAllForUser(userUuid: string, limit: number, offset: number): Promise<ProposalListItemDto[]> {
    const rows = await this.db
      .select(listColumns)
      .from(proposals)
      .innerJoin(users, eq(users.internal_id, proposals.user_id))
      .where(eq(users.id, userUuid))
      .orderBy(desc(proposals.created_at))
      .limit(limit)
      .offset(offset);

    return rows as ProposalListItemDto[];
  }

  async countForUser(userUuid: string): Promise<number> {
    const [row] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(proposals)
      .innerJoin(users, eq(users.internal_id, proposals.user_id))
      .where(eq(users.id, userUuid));

    return row?.count ?? 0;
  }

  async hasInProgressForUser(userUuid: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: proposals.id })
      .from(proposals)
      .innerJoin(users, eq(users.internal_id, proposals.user_id))
      .where(and(eq(users.id, userUuid), eq(proposals.status, "generating")))
      .limit(1);

    return Boolean(row);
  }

  async update(id: string, userUuid: string, dto: UpdateProposalDto): Promise<ProposalDto | undefined> {
    const user = await this.db.query.users.findFirst({ where: eq(users.id, userUuid) });
    if (!user) return undefined;

    const updates: Record<string, unknown> = { updated_at: new Date() };
    if (dto.title !== undefined) updates.title = dto.title;
    if (dto.content !== undefined) updates.content = dto.content;

    const [row] = await this.db
      .update(proposals)
      .set(updates)
      .where(and(eq(proposals.id, id), eq(proposals.user_id, user.internal_id)))
      .returning(dtoColumns);

    return row ? toDto(row as unknown as Record<string, unknown>) : undefined;
  }

  async delete(id: string, userUuid: string): Promise<boolean> {
    const user = await this.db.query.users.findFirst({ where: eq(users.id, userUuid) });
    if (!user) return false;

    const deleted = await this.db
      .delete(proposals)
      .where(and(eq(proposals.id, id), eq(proposals.user_id, user.internal_id)))
      .returning({ id: proposals.id });

    return deleted.length > 0;
  }
}
