import { and, eq } from "drizzle-orm";
import { Database } from "../connection.js";
import { plans, userSubscriptions, users } from "../schema/index.js";
import { ISubscriptionRepository } from "@/modules/subscription/interfaces/repository.interface.js";
import {
  ActiveSubscriptionDto,
  AdminCreateSubscriptionDto,
  AdminUpdateSubscriptionDto,
  SubscriptionDetailDto,
  SubscriptionStatus,
} from "@/modules/subscription/types/index.js";

const FREE_PLAN_END = new Date("9999-12-31");

const detailColumns = {
  id: userSubscriptions.id,
  status: userSubscriptions.status,
  current_period_start: userSubscriptions.current_period_start,
  current_period_end: userSubscriptions.current_period_end,
  trial_ends_at: userSubscriptions.trial_ends_at,
  canceled_at: userSubscriptions.canceled_at,
  stripe_customer_id: userSubscriptions.stripe_customer_id,
  stripe_subscription_id: userSubscriptions.stripe_subscription_id,
  created_at: userSubscriptions.created_at,
  updated_at: userSubscriptions.updated_at,
  plan: {
    id: plans.id,
    name: plans.name,
    max_documents_per_day: plans.max_documents_per_day,
    price_monthly: plans.price_monthly,
    price_yearly: plans.price_yearly,
  },
  user: {
    id: users.id,
    email: users.email,
    username: users.username,
  },
};

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

  async adminFindAll(status?: SubscriptionStatus): Promise<SubscriptionDetailDto[]> {
    const query = this.db
      .select(detailColumns)
      .from(userSubscriptions)
      .innerJoin(plans, eq(plans.internal_id, userSubscriptions.plan_id))
      .innerJoin(users, eq(users.internal_id, userSubscriptions.user_id));

    if (status) {
      return query.where(eq(userSubscriptions.status, status)) as Promise<SubscriptionDetailDto[]>;
    }

    return query as Promise<SubscriptionDetailDto[]>;
  }

  async adminFindById(id: string): Promise<SubscriptionDetailDto | undefined> {
    const [row] = await this.db
      .select(detailColumns)
      .from(userSubscriptions)
      .innerJoin(plans, eq(plans.internal_id, userSubscriptions.plan_id))
      .innerJoin(users, eq(users.internal_id, userSubscriptions.user_id))
      .where(eq(userSubscriptions.id, id))
      .limit(1);

    return row as SubscriptionDetailDto | undefined;
  }

  async adminFindByUserUuid(userUuid: string): Promise<SubscriptionDetailDto[]> {
    return this.db
      .select(detailColumns)
      .from(userSubscriptions)
      .innerJoin(plans, eq(plans.internal_id, userSubscriptions.plan_id))
      .innerJoin(users, eq(users.internal_id, userSubscriptions.user_id))
      .where(eq(users.id, userUuid)) as Promise<SubscriptionDetailDto[]>;
  }

  async adminCreate(dto: AdminCreateSubscriptionDto): Promise<SubscriptionDetailDto> {
    const plan = await this.db.query.plans.findFirst({ where: eq(plans.id, dto.plan_uuid) });
    if (!plan) throw new Error("Plan not found.");

    const user = await this.db.query.users.findFirst({ where: eq(users.id, dto.user_uuid) });
    if (!user) throw new Error("User not found.");

    await this.db.insert(userSubscriptions).values({
      user_id: user.internal_id,
      plan_id: plan.internal_id,
      status: dto.status ?? "active",
      current_period_start: dto.current_period_start,
      current_period_end: dto.current_period_end,
      trial_ends_at: dto.trial_ends_at,
      stripe_customer_id: dto.stripe_customer_id,
      stripe_subscription_id: dto.stripe_subscription_id,
    });

    const created = await this.adminFindByUserUuid(dto.user_uuid);
    return created[created.length - 1];
  }

  async adminUpdate(id: string, dto: AdminUpdateSubscriptionDto): Promise<SubscriptionDetailDto | undefined> {
    const updates: Record<string, unknown> = { updated_at: new Date() };

    if (dto.status !== undefined) updates.status = dto.status;
    if (dto.current_period_end !== undefined) updates.current_period_end = dto.current_period_end;
    if (dto.trial_ends_at !== undefined) updates.trial_ends_at = dto.trial_ends_at;
    if (dto.stripe_customer_id !== undefined) updates.stripe_customer_id = dto.stripe_customer_id;
    if (dto.stripe_subscription_id !== undefined) updates.stripe_subscription_id = dto.stripe_subscription_id;

    if (dto.plan_uuid) {
      const plan = await this.db.query.plans.findFirst({ where: eq(plans.id, dto.plan_uuid) });
      if (!plan) throw new Error("Plan not found.");
      updates.plan_id = plan.internal_id;
    }

    await this.db.update(userSubscriptions).set(updates).where(eq(userSubscriptions.id, id));

    return this.adminFindById(id);
  }

  async adminCancel(id: string): Promise<SubscriptionDetailDto | undefined> {
    await this.db
      .update(userSubscriptions)
      .set({ status: "canceled", canceled_at: new Date(), updated_at: new Date() })
      .where(eq(userSubscriptions.id, id));

    return this.adminFindById(id);
  }
}
