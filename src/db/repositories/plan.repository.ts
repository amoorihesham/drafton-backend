import { eq } from "drizzle-orm";
import { Database } from "../connection.js";
import { plans } from "../schema/index.js";
import { IPlanRepository } from "@/modules/plans/interfaces/repository.interface.js";
import { CreatePlanDto, PlanDto, UpdatePlanDto } from "@/modules/plans/types/index.js";

export class PlanRepository implements IPlanRepository {
  constructor(private readonly db: Database) {}

  async findAll(): Promise<PlanDto[]> {
    return this.db.select().from(plans) as Promise<PlanDto[]>;
  }

  async findById(id: string): Promise<PlanDto | undefined> {
    return this.db.query.plans.findFirst({ where: eq(plans.id, id) }) as Promise<PlanDto | undefined>;
  }

  async create(dto: CreatePlanDto): Promise<PlanDto> {
    const [plan] = await this.db.insert(plans).values(dto).returning();
    return plan as PlanDto;
  }

  async update(id: string, dto: UpdatePlanDto): Promise<PlanDto | undefined> {
    const [plan] = await this.db
      .update(plans)
      .set({ ...dto, updated_at: new Date() })
      .where(eq(plans.id, id))
      .returning();
    return plan as PlanDto | undefined;
  }

  async deactivate(id: string): Promise<PlanDto | undefined> {
    const [plan] = await this.db
      .update(plans)
      .set({ is_active: false, updated_at: new Date() })
      .where(eq(plans.id, id))
      .returning();
    return plan as PlanDto | undefined;
  }
}
