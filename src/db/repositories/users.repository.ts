import { IUserRepository } from "@/modules/users/interfaces/repository.interface";
import { plans, users, userSubscriptions } from "../schema";
import { Database } from "../connection";
import { and, eq } from "drizzle-orm";

export class UsersRepository implements IUserRepository {
  constructor(private readonly db: Database) {}

  async findByEmail(email: string) {
    return this.db.query.users.findFirst({ where: eq(users.email, email) });
  }

  async findById(id: string) {
    return this.db.query.users.findFirst({ where: eq(users.id, id) });
  }

  async findUserWithSubscription(id: string) {
    return this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .innerJoin(
        userSubscriptions,
        and(eq(userSubscriptions.user_id, users.internal_id), eq(userSubscriptions.status, "active")),
      )
      .leftJoin(plans, eq(userSubscriptions.plan_id, plans.internal_id))
      .limit(1);
  }
}
