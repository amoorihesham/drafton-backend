import { and, eq } from "drizzle-orm";
import { Database } from "../connection.js";
import { plans, userSubscriptions } from "../schema/index.js";
import { ISubscriptionRepository } from "@/modules/subscription/interfaces/repository.interface.js";
import { ActiveSubscriptionDto } from "@/modules/subscription/types/index.js";

const FREE_PLAN_END = new Date("9999-12-31");

export class SubscriptionRepository implements ISubscriptionRepository {
  constructor(private readonly db: Database) {}

  async createFreeSubscription(userInternalId: number): Promise<void> {
    const freePlan = await this.db.query.plans.findFirst({
      where: eq(plans.name, "free"),
    });

    if (!freePlan) {
      throw new Error("Free plan not found — run db:seed before starting the app.");
    }

    const now = new Date();

    await this.db.insert(userSubscriptions).values({
      user_id: userInternalId,
      plan_id: freePlan.internal_id,
      status: "active",
      current_period_start: now,
      current_period_end: FREE_PLAN_END,
    });
  }

  async getActiveSubscription(userInternalId: number): Promise<ActiveSubscriptionDto> {
    const [row] = await this.db
      .select({
        planName: plans.name,
        status: userSubscriptions.status,
        maxDocumentsPerDay: plans.max_documents_per_day,
        features: plans.features,
        currentPeriodStart: userSubscriptions.current_period_start,
        currentPeriodEnd: userSubscriptions.current_period_end,
        trialEndsAt: userSubscriptions.trial_ends_at,
      })
      .from(userSubscriptions)
      .innerJoin(plans, eq(plans.internal_id, userSubscriptions.plan_id))
      .where(
        and(
          eq(userSubscriptions.user_id, userInternalId),
          eq(userSubscriptions.status, "active"),
        ),
      )
      .limit(1);

    return row ?? null;
  }
}
