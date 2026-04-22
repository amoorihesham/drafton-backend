import {
  GenerateProposalDto,
  ProposalDto,
  ProposalListItemDto,
  UpdateProposalDto,
} from "../types/index.js";

export interface IProposalService {
  generate(userUuid: string, dto: GenerateProposalDto): Promise<ProposalDto>;
  getById(userUuid: string, id: string): Promise<ProposalDto>;
  getAll(userUuid: string, page: number, pageSize: number): Promise<{
    items: ProposalListItemDto[];
    total: number;
    page: number;
    pageSize: number;
  }>;
  update(userUuid: string, id: string, dto: UpdateProposalDto): Promise<ProposalDto>;
  delete(userUuid: string, id: string): Promise<void>;
}
