import { db } from "@/db";
import { reports } from "@/db/schema";
import type { ReportItem } from "@/lib/types";
import { desc, eq } from "drizzle-orm";
import { awardPoints } from "@/lib/services/green-points";
import { ACTIVITY_POINTS } from "@/lib/green-points-constants";

const DEMO_USER = "demo-user";

function toDto(row: typeof reports.$inferSelect): ReportItem {
  return {
    id: row.id,
    category: row.category,
    locationLabel: row.locationLabel,
    lat: row.lat,
    lng: row.lng,
    description: row.description,
    photoDataUrl: row.photoDataUrl,
    status: row.status,
    pointsAwarded: row.pointsAwarded,
    createdAt: new Date(row.createdAt).toISOString(),
  };
}

export async function listReports(): Promise<ReportItem[]> {
  const rows = await db.select().from(reports).where(eq(reports.userId, DEMO_USER)).orderBy(desc(reports.createdAt));
  return rows.map(toDto);
}

export interface CreateReportInput {
  category: string;
  locationLabel: string;
  lat?: number | null;
  lng?: number | null;
  description: string;
  photoDataUrl?: string | null;
}

export async function createReport(input: CreateReportInput): Promise<ReportItem> {
  const points = ACTIVITY_POINTS.submit_report;
  const inserted = await db
    .insert(reports)
    .values({
      userId: DEMO_USER,
      category: input.category,
      locationLabel: input.locationLabel,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      description: input.description,
      photoDataUrl: input.photoDataUrl ?? null,
      status: "Đã tiếp nhận",
      pointsAwarded: points,
    })
    .returning();

  await awardPoints("submit_report", `Báo cáo: ${input.category} tại ${input.locationLabel}`);
  return toDto(inserted[0]);
}
