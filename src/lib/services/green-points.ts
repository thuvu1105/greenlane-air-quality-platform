import { db } from "@/db";
import { greenPointsActivities } from "@/db/schema";
import type { GreenPointsActivity, GreenPointsSummary } from "@/lib/types";
import { desc, eq, sql } from "drizzle-orm";
import { ACTIVITY_POINTS, ACTIVITY_LABELS } from "@/lib/green-points-constants";

const DEMO_USER = "demo-user";

export { ACTIVITY_POINTS, ACTIVITY_LABELS };

let welcomeBonusPromise: Promise<void> | null = null;

async function ensureWelcomeBonus(): Promise<void> {
  if (!welcomeBonusPromise) {
    welcomeBonusPromise = (async () => {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(greenPointsActivities);
      if (count > 0) return;
      await db.insert(greenPointsActivities).values({
        userId: DEMO_USER,
        activityType: "welcome_bonus",
        points: ACTIVITY_POINTS.welcome_bonus,
        description: ACTIVITY_LABELS.welcome_bonus,
      });
    })();
  }
  return welcomeBonusPromise;
}

export async function awardPoints(activityType: keyof typeof ACTIVITY_POINTS, description?: string): Promise<void> {
  await ensureWelcomeBonus();
  await db.insert(greenPointsActivities).values({
    userId: DEMO_USER,
    activityType,
    points: ACTIVITY_POINTS[activityType] ?? 0,
    description: description ?? ACTIVITY_LABELS[activityType] ?? activityType,
  });
}

export async function getGreenPointsSummary(): Promise<GreenPointsSummary> {
  await ensureWelcomeBonus();
  const rows = await db
    .select()
    .from(greenPointsActivities)
    .where(eq(greenPointsActivities.userId, DEMO_USER))
    .orderBy(desc(greenPointsActivities.createdAt));

  const activities: GreenPointsActivity[] = rows.map((r) => ({
    id: r.id,
    activityType: r.activityType,
    points: r.points,
    description: r.description,
    createdAt: new Date(r.createdAt).toISOString(),
  }));

  const balance = activities.reduce((sum, a) => sum + a.points, 0);
  return { balance, activities };
}
