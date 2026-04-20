import { CreatePlanDto, PlanDto, UpdatePlanDto } from "../types/index.js";

export interface IPlanService {
  getAll(): Promise<PlanDto[]>;
  getById(id: string): Promise<PlanDto>;
  create(dto: CreatePlanDto): Promise<PlanDto>;
  update(id: string, dto: UpdatePlanDto): Promise<PlanDto>;
  deactivate(id: string): Promise<PlanDto>;
}
