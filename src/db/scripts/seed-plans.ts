import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { plans } from "../schema/index.js";
import * as schema from "../schema/index.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});

const db = drizzle(pool, { schema });

const planSeeds: (typeof plans.$inferInsert)[] = [
  {
    name: "free",
    price_monthly: 0,
    price_yearly: 0,
    max_documents_per_day: 5,
    features: {
      ai_generation: false,
      priority_support: false,
      custom_branding: false,
    },
  },
  {
    name: "pro",
    // TODO: update prices before going live (values in cents)
    price_monthly: 999,
    price_yearly: 9990,
    max_documents_per_day: 15,
    features: {
      ai_generation: true,
      priority_support: false,
      custom_branding: false,
    },
  },
  {
    name: "ultimate",
    // TODO: update prices before going live (values in cents)
    price_monthly: 2999,
    price_yearly: 29990,
    max_documents_per_day: 30,
    features: {
      ai_generation: true,
      priority_support: true,
      custom_branding: true,
    },
  },
];

async function seedPlans() {
  console.log("Seeding plans...");

  for (const plan of planSeeds) {
    await db
      .insert(plans)
      .values(plan)
      .onConflictDoUpdate({
        target: plans.name,
        set: {
          price_monthly: plan.price_monthly,
          price_yearly: plan.price_yearly,
          max_documents_per_day: plan.max_documents_per_day,
          features: plan.features,
        },
      });

    console.log(`  + ${plan.name} plan seeded`);
  }

  console.log("Done.");
  await pool.end();
}

seedPlans().catch(async (err) => {
  console.error("Seed failed:", err);
  await pool.end();
  process.exit(1);
});
