import { db } from "@/db";
import { alertSettings } from "@/db/schema";
import type { AlertSettings } from "@/lib/types";
import { eq } from "drizzle-orm";

const DEMO_USER = "demo-user";

function toDto(row: typeof alertSettings.$inferSelect): AlertSettings {
  return {
    notificationsEnabled: row.notificationsEnabled,
    pm25Threshold: row.pm25Threshold,
    sensitiveMode: row.sensitiveMode,
    preferredStartTime: row.preferredStartTime,
    preferredEndTime: row.preferredEndTime,
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

export async function getAlertSettings(): Promise<AlertSettings> {
  const existing = await db.select().from(alertSettings).where(eq(alertSettings.userId, DEMO_USER));
  if (existing.length > 0) return toDto(existing[0]);

  const inserted = await db
    .insert(alertSettings)
    .values({ userId: DEMO_USER })
    .returning();
  return toDto(inserted[0]);
}

export interface AlertSettingsInput {
  notificationsEnabled: boolean;
  pm25Threshold: number;
  sensitiveMode: boolean;
  preferredStartTime: string;
  preferredEndTime: string;
}

export async function updateAlertSettings(input: AlertSettingsInput): Promise<AlertSettings> {
  await getAlertSettings(); // ensure row exists
  const updated = await db
    .update(alertSettings)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(alertSettings.userId, DEMO_USER))
    .returning();
  return toDto(updated[0]);
}
