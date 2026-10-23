import { computeInAppAlerts } from "@/lib/services/in-app-alerts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const alerts = await computeInAppAlerts();
    return Response.json({ alerts, note: "Đây là thông báo trong ứng dụng, GreenLane chưa gửi push notification thực tế." });
  } catch (error) {
    console.error("GET /api/alerts/feed failed", error);
    return Response.json({ error: "Không thể tải cảnh báo." }, { status: 500 });
  }
}
