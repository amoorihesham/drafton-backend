import {
  CreateProposalRow,
  ProposalDto,
  ProposalListItemDto,
  UpdateProposalDto,
} from "../types/index.js";

export interface IProposalRepository {
  create(row: CreateProposalRow): Promise<ProposalDto>;
  findByIdForUser(id: string, userUuid: string): Promise<ProposalDto | undefined>;
  findAllForUser(userUuid: string, limit: number, offset: number): Promise<ProposalListItemDto[]>;
  countForUser(userUuid: string): Promise<number>;
  hasInProgressForUser(userUuid: string): Promise<boolean>;
  update(id: string, userUuid: string, dto: UpdateProposalDto): Promise<ProposalDto | undefined>;
  delete(id: string, userUuid: string): Promise<boolean>;
}
