import { createReport, listReports } from "@/lib/services/reports";
import { NextRequest } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const reportSchema = z.object({
  category: z.string().min(1),
  locationLabel: z.string().min(2, "Vui lòng nhập vị trí."),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  description: z.string().min(5, "Vui lòng mô tả chi tiết hơn (tối thiểu 5 ký tự)."),
  photoDataUrl: z.string().nullable().optional(),
});

export async function GET() {
  const reports = await listReports();
  return Response.json({ reports });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Dữ liệu báo cáo không hợp lệ.";
      return Response.json({ error: message }, { status: 400 });
    }
    const report = await createReport(parsed.data);
    return Response.json({ report });
  } catch (error) {
    console.error("POST /api/reports failed", error);
    return Response.json({ error: "Không thể gửi báo cáo lúc này." }, { status: 500 });
  }
}
