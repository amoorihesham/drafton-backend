import { NotFoundException } from "@/shared/errors/http.errors.js";
import { IPlanRepository } from "./interfaces/repository.interface.js";
import { IPlanService } from "./interfaces/service.interface.js";
import { PLAN_ERROR_CODES, PLAN_MESSAGES } from "./constants/messages.js";
import { CreatePlanDto, PlanDto, UpdatePlanDto } from "./types/index.js";

export class PlanService implements IPlanService {
  constructor(private readonly planRepository: IPlanRepository) {}

  async getAll(): Promise<PlanDto[]> {
    return this.planRepository.findAll();
  }

  async getById(id: string): Promise<PlanDto> {
    const plan = await this.planRepository.findById(id);
    if (!plan) {
      throw new NotFoundException(PLAN_MESSAGES.NOT_FOUND, PLAN_ERROR_CODES.NOT_FOUND);
    }
    return plan;
  }

  async create(dto: CreatePlanDto): Promise<PlanDto> {
    return this.planRepository.create(dto);
  }

  async update(id: string, dto: UpdatePlanDto): Promise<PlanDto> {
    const plan = await this.planRepository.update(id, dto);
    if (!plan) {
      throw new NotFoundException(PLAN_MESSAGES.NOT_FOUND, PLAN_ERROR_CODES.NOT_FOUND);
    }
    return plan;
  }

  async deactivate(id: string): Promise<PlanDto> {
    const plan = await this.planRepository.deactivate(id);
    if (!plan) {
      throw new NotFoundException(PLAN_MESSAGES.NOT_FOUND, PLAN_ERROR_CODES.NOT_FOUND);
    }
    return plan;
  }
}
