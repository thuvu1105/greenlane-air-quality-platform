import { getAlertSettings, updateAlertSettings } from "@/lib/services/alert-settings";
import { NextRequest } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const settingsSchema = z.object({
  notificationsEnabled: z.boolean(),
  pm25Threshold: z.number().min(0).max(500),
  sensitiveMode: z.boolean(),
  preferredStartTime: z.string().regex(/^\d{2}:\d{2}$/),
  preferredEndTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export async function GET() {
  const settings = await getAlertSettings();
  return Response.json({ settings });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Cài đặt không hợp lệ." }, { status: 400 });
    }
    const settings = await updateAlertSettings(parsed.data);
    return Response.json({ settings });
  } catch (error) {
    console.error("PUT /api/alerts/settings failed", error);
    return Response.json({ error: "Không thể lưu cài đặt cảnh báo." }, { status: 500 });
  }
}
