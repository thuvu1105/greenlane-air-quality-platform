"use client";

import { useRef, useState } from "react";
import { Badge, Button, Card, EmptyState, SectionTitle, Spinner } from "@/components/ui/primitives";
import { useFetchJson } from "@/lib/hooks/use-fetch";
import { ACTIVITY_LABELS } from "@/lib/green-points-constants";
import type { GreenPointsSummary, ReportItem } from "@/lib/types";

const CATEGORIES = [
  "Khói bụi từ công trình/xe tải",
  "Đốt rác/khói thải bất thường",
  "Ùn tắc kéo dài gây ô nhiễm",
  "Cây xanh/mảng xanh bị thu hẹp",
  "Khác",
];

const MISSIONS = [
  { title: "So sánh một tuyến đường mới", points: 5, hint: "Dùng màn hình Bản đồ để tìm và so sánh tuyến." },
  { title: "Lưu một tuyến đường yêu thích", points: 10, hint: "Lưu tuyến từ kết quả so sánh." },
  { title: "Gửi 1 báo cáo môi trường", points: 20, hint: "Điền form báo cáo bên dưới." },
];

export default function GreenPointsPage() {
  const pointsQuery = useFetchJson<GreenPointsSummary>("/api/green-points", []);
  const reportsQuery = useFetchJson<{ reports: ReportItem[] }>("/api/reports", []);

  const [category, setCategory] = useState(CATEGORIES[0]);
  const [locationLabel, setLocationLabel] = useState("");
  const [description, setDescription] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      setFormError("Ảnh quá lớn, vui lòng chọn ảnh dưới 1.5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);
    if (locationLabel.trim().length < 2) {
      setFormError("Vui lòng nhập vị trí cụ thể hơn.");
      return;
    }
    if (description.trim().length < 5) {
      setFormError("Vui lòng mô tả chi tiết hơn (tối thiểu 5 ký tự).");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, locationLabel, description, photoDataUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Không thể gửi báo cáo.");
      setSuccessMsg("Đã gửi báo cáo! Bạn vừa nhận +20 Điểm xanh (mô phỏng).");
      setLocationLabel("");
      setDescription("");
      setPhotoDataUrl(null);
      if (fileRef.current) fileRef.current.value = "";
      pointsQuery.refetch();
      reportsQuery.refetch();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Có lỗi xảy ra.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="gl-scrollbar h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
        <SectionTitle
          title="Điểm xanh"
          subtitle="Hệ thống điểm thưởng mô phỏng cho mục đích minh họa sản phẩm — đây KHÔNG phải điểm thưởng/quà tặng thật."
        />

        <Card className="bg-gradient-to-br from-[#116B45] to-[#27A765] p-5 text-white">
          <p className="text-xs uppercase tracking-wide text-white/80">Số dư Điểm xanh (demo)</p>
          {pointsQuery.loading ? (
            <Spinner className="mt-2 h-6 w-6" />
          ) : (
            <p className="mt-1 text-4xl font-extrabold">{pointsQuery.data?.balance ?? 0}</p>
          )}
          <p className="mt-2 text-xs text-white/80">Tích lũy bằng cách so sánh tuyến, lưu tuyến và gửi báo cáo môi trường.</p>
        </Card>

        <Card className="mt-4 p-4">
          <h3 className="text-sm font-bold text-[#18352B]">Nhiệm vụ gợi ý</h3>
          <div className="mt-3 space-y-2">
            {MISSIONS.map((m) => (
              <div key={m.title} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-[#18352B]">{m.title}</p>
                  <p className="text-xs text-slate-500">{m.hint}</p>
                </div>
                <Badge tone="green">+{m.points} điểm</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="mt-4 p-4">
          <h3 className="text-sm font-bold text-[#18352B]">Lịch sử hoạt động</h3>
          {pointsQuery.loading ? (
            <div className="flex justify-center py-6"><Spinner className="h-5 w-5 text-[#27A765]" /></div>
          ) : pointsQuery.data && pointsQuery.data.activities.length > 0 ? (
            <ul className="mt-3 divide-y divide-slate-100">
              {pointsQuery.data.activities.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-[#18352B]">{ACTIVITY_LABELS[a.activityType] ?? a.description}</p>
                    <p className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleString("vi-VN")}</p>
                  </div>
                  <span className="font-bold text-[#27A765]">+{a.points}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon="🌱" title="Chưa có hoạt động nào" />
          )}
        </Card>

        <Card className="mt-4 p-4">
          <h3 className="text-sm font-bold text-[#18352B]">Gửi báo cáo môi trường</h3>
          <p className="mt-1 text-xs text-slate-500">
            Báo cáo của bạn được lưu trong hệ thống của GreenLane để minh họa quy trình tiếp nhận — hiện <strong>chưa</strong> có bước xác
            minh hiện trường.
          </p>
          <form onSubmit={handleSubmit} className="mt-3 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500">Danh mục</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500">Vị trí</label>
              <input
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                placeholder="VD: Ngã tư Hàng Xanh, Bình Thạnh"
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500">Mô tả</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Mô tả ngắn gọn tình trạng bạn quan sát được…"
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500">Ảnh minh họa (tùy chọn, &lt; 1.5MB)</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="mt-1 text-xs" />
              {photoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoDataUrl} alt="Ảnh báo cáo" className="mt-2 h-28 w-28 rounded-lg object-cover" />
              ) : null}
            </div>
            {formError ? <p className="text-xs font-medium text-[#C83A2C]">{formError}</p> : null}
            {successMsg ? <p className="text-xs font-medium text-[#116B45]">{successMsg}</p> : null}
            <Button type="submit" disabled={submitting}>
              {submitting ? <Spinner /> : null}
              Gửi báo cáo
            </Button>
          </form>
        </Card>

        <Card className="mt-4 p-4">
          <h3 className="text-sm font-bold text-[#18352B]">Báo cáo đã gửi</h3>
          {reportsQuery.loading ? (
            <div className="flex justify-center py-6"><Spinner className="h-5 w-5 text-[#27A765]" /></div>
          ) : reportsQuery.data && reportsQuery.data.reports.length > 0 ? (
            <div className="mt-3 space-y-2.5">
              {reportsQuery.data.reports.map((r) => (
                <div key={r.id} className="rounded-xl border border-slate-100 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#18352B]">{r.category}</p>
                    <Badge tone="blue">{r.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">📍 {r.locationLabel}</p>
                  <p className="mt-1 text-xs text-slate-600">{r.description}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{new Date(r.createdAt).toLocaleString("vi-VN")} · +{r.pointsAwarded} điểm</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="📝" title="Chưa có báo cáo nào được gửi" />
          )}
        </Card>
      </div>
    </div>
  );
}
