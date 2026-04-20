import { Database } from "@/db/connection.js";
import { PlanRepository } from "@/db/repositories/plan.repository.js";
import { PlanService } from "./plans.service.js";
import { PlanController } from "./plans.controller.js";

export const buildPlanModule = (db: Database): PlanController => {
  const planRepository = new PlanRepository(db);
  const planService = new PlanService(planRepository);
  return new PlanController(planService);
};
