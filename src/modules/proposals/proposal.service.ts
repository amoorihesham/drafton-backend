import { randomUUID } from "crypto";
import { IAnthropicService } from "@/shared/services/anthropic/anthropic.service.interface.js";
import { IProposalRepository } from "./interfaces/repository.interface.js";
import { IProposalService } from "./interfaces/service.interface.js";
import {
  CreateProposalType,
  GenerateProposalDto,
  ProposalDto,
  ProposalListItemDto,
  UpdateProposalDto,
} from "./types/index.js";
import { ProposalNotFoundError, ProposalInProgressError } from "./constants/errors.js";
import { AiProposalContent, ProposalContent } from "./schemas/block.schema.js";
import { Database } from "@/db/connection.js";
import { users } from "@/db/schema/index.js";
import { eq } from "drizzle-orm";

const DEFAULT_TITLE = "Untitled proposal";

export class ProposalService implements IProposalService {
  constructor(
    private readonly proposalRepository: IProposalRepository,

    private readonly anthropicService: IAnthropicService,
    private readonly db: Database,
  ) {}

  async generate(userUuid: string, dto: CreateProposalType): Promise<ProposalDto> {
    if (hasInProgress) {
      throw new ProposalInProgressError();
    }

    const user = await this.db.query.users.findFirst({ where: eq(users.id, userUuid) });
    if (!user) {
      throw new ProposalNotFoundError();
    }

    const { content: aiContent, model } = await this.anthropicService.generateProposal({
      prompt: dto.prompt,
    });

    const content = stampSectionIds(aiContent);
    const title = dto.title ?? aiContent.title ?? DEFAULT_TITLE;

    return this.proposalRepository.create({
      user_internal_id: user.internal_id,
      title,
      prompt: dto.prompt,
      content,
      model,
      status: "ready",
    });
  }

  async getById(id: string): Promise<ProposalDto> {
    const proposal = await this.proposalRepository.findById(id);
    if (!proposal) throw new ProposalNotFoundError();
    return proposal;
  }

  async getAll(
    userUuid: string,
    page: number,
    pageSize: number,
  ): Promise<{
    items: ProposalListItemDto[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const offset = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.proposalRepository.findAllForUser(userUuid, pageSize, offset),
      this.proposalRepository.countForUser(userUuid),
    ]);
    return { items, total, page, pageSize };
  }

  async update(userUuid: string, id: string, dto: UpdateProposalDto): Promise<ProposalDto> {
    const updated = await this.proposalRepository.update(id, userUuid, dto);
    if (!updated) throw new ProposalNotFoundError();
    return updated;
  }

  async delete(userUuid: string, id: string): Promise<void> {
    const deleted = await this.proposalRepository.delete(id, userUuid);
    if (!deleted) throw new ProposalNotFoundError();
  }
}

function stampSectionIds(ai: AiProposalContent): ProposalContent {
  return {
    sections: ai.sections.map((s) => ({
      id: randomUUID(),
      title: s.title,
      blocks: s.blocks,
    })),
  };
}
