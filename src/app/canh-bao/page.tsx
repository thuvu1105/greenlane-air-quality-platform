"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, EmptyState, SectionTitle, Spinner, Toggle } from "@/components/ui/primitives";
import { useFetchJson } from "@/lib/hooks/use-fetch";
import type { AlertSettings, InAppAlert } from "@/lib/types";

const SEVERITY_TONE: Record<InAppAlert["severity"], "amber" | "red" | "blue"> = {
  warning: "amber",
  danger: "red",
  info: "blue",
};

export default function AlertsPage() {
  const { data: settingsData, loading: settingsLoading, refetch: refetchSettings } = useFetchJson<{
    settings: AlertSettings;
  }>("/api/alerts/settings", []);
  const { data: alertsData, loading: alertsLoading, refetch: refetchAlerts } = useFetchJson<{
    alerts: InAppAlert[];
    note: string;
  }>("/api/alerts/feed", []);

  const [form, setForm] = useState<AlertSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (settingsData?.settings) setForm(settingsData.settings);
  }, [settingsData]);

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/alerts/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Không thể lưu cài đặt.");
      setSaveMessage("Đã lưu cài đặt cảnh báo.");
      refetchSettings();
      refetchAlerts();
    } catch (e) {
      setSaveMessage(e instanceof Error ? e.message : "Có lỗi xảy ra.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="gl-scrollbar h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
        <SectionTitle
          title="Cảnh báo chất lượng không khí"
          subtitle="Thông báo trong ứng dụng dựa trên ngưỡng bạn cài đặt và dữ liệu mô phỏng hiện có. GreenLane chưa gửi push notification ra ngoài trình duyệt."
        />

        <Card className="p-4">
          <h3 className="text-sm font-bold text-[#18352B]">Cảnh báo hiện tại</h3>
          {alertsLoading ? (
            <div className="flex justify-center py-6"><Spinner className="h-5 w-5 text-[#27A765]" /></div>
          ) : alertsData && alertsData.alerts.length > 0 ? (
            <div className="mt-3 space-y-2.5">
              {alertsData.alerts.map((a) => (
                <div key={a.id} className="rounded-xl border border-slate-100 p-3">
                  <div className="flex items-center gap-2">
                    <Badge tone={SEVERITY_TONE[a.severity]}>
                      {a.severity === "danger" ? "Nghiêm trọng" : a.severity === "warning" ? "Cảnh báo" : "Thông tin"}
                    </Badge>
                    <p className="text-sm font-semibold text-[#18352B]">{a.title}</p>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{a.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3">
              <EmptyState icon="✅" title="Không có cảnh báo nào" description="Các tuyến đã lưu và khu vực theo dõi hiện đang dưới ngưỡng cảnh báo của bạn." />
            </div>
          )}
          {alertsData?.note ? <p className="mt-3 text-[11px] italic text-slate-400">{alertsData.note}</p> : null}
        </Card>

        <Card className="mt-4 p-4">
          <h3 className="text-sm font-bold text-[#18352B]">Cài đặt cá nhân</h3>
          {settingsLoading || !form ? (
            <div className="flex justify-center py-6"><Spinner className="h-5 w-5 text-[#27A765]" /></div>
          ) : (
            <div className="mt-3 space-y-4">
              <Toggle
                checked={form.notificationsEnabled}
                onChange={(v) => setForm({ ...form, notificationsEnabled: v })}
                label="Bật thông báo trong ứng dụng"
                description="Khi tắt, GreenLane sẽ không tính toán cảnh báo mới."
              />

              <div>
                <label className="block text-sm font-semibold text-[#18352B]">
                  Ngưỡng cảnh báo PM2.5: {form.pm25Threshold} µg/m³
                </label>
                <input
                  type="range"
                  min={20}
                  max={150}
                  step={5}
                  value={form.pm25Threshold}
                  onChange={(e) => setForm({ ...form, pm25Threshold: Number(e.target.value) })}
                  className="mt-2 w-full accent-[#27A765]"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Khi điểm đo lân cận tuyến đã lưu vượt ngưỡng này, GreenLane sẽ tạo cảnh báo trong mục bên trên.
                </p>
              </div>

              <Toggle
                checked={form.sensitiveMode}
                onChange={(v) => setForm({ ...form, sensitiveMode: v })}
                label="Chế độ nhạy cảm"
                description="Tự động hạ ngưỡng cảnh báo và nhấn mạnh các tuyến sạch hơn."
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Khung giờ thường di chuyển — từ</label>
                  <input
                    type="time"
                    value={form.preferredStartTime}
                    onChange={(e) => setForm({ ...form, preferredStartTime: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">đến</label>
                  <input
                    type="time"
                    value={form.preferredEndTime}
                    onChange={(e) => setForm({ ...form, preferredEndTime: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
                  />
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Spinner /> : null}
                Lưu cài đặt
              </Button>
              {saveMessage ? <p className="text-xs font-medium text-[#116B45]">{saveMessage}</p> : null}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
