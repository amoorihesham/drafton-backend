import { CreatePlanDto, PlanDto, UpdatePlanDto } from "../types/index.js";

export interface IPlanRepository {
  findAll(): Promise<PlanDto[]>;
  findById(id: string): Promise<PlanDto | undefined>;
  create(dto: CreatePlanDto): Promise<PlanDto>;
  update(id: string, dto: UpdatePlanDto): Promise<PlanDto | undefined>;
  deactivate(id: string): Promise<PlanDto | undefined>;
}
