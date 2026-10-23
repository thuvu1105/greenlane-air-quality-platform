"use client";

import { Badge, Button, Spinner } from "@/components/ui/primitives";
import type { RouteOption } from "@/lib/types";

const TYPE_STYLE: Record<RouteOption["routeType"], { tone: "blue" | "green" | "purple"; icon: string }> = {
  fastest: { tone: "blue", icon: "⚡" },
  cleaner: { tone: "green", icon: "🌿" },
  balanced: { tone: "purple", icon: "⚖️" },
};

const CONFIDENCE_LABEL: Record<RouteOption["confidence"], string> = {
  high: "Độ tin cậy cao",
  medium: "Độ tin cậy trung bình",
  low: "Độ tin cậy thấp",
};

export function RouteCard({
  route,
  selected,
  onSelect,
  onSave,
  saving,
}: {
  route: RouteOption;
  selected: boolean;
  onSelect: () => void;
  onSave?: () => void;
  saving?: boolean;
}) {
  const style = TYPE_STYLE[route.routeType];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border-2 p-3.5 text-left transition-colors ${
        selected ? "border-[#27A765] bg-[#F3FBF6]" : "border-slate-100 bg-white hover:border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{style.icon}</span>
          <div>
            <p className="text-sm font-bold text-[#18352B]">{route.name}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <Badge tone={style.tone}>{route.provider === "fallback-simulated" ? "Demo mô phỏng" : "OSRM/OSM"}</Badge>
              {route.isRecommended ? <Badge tone="amber">Đề xuất theo lựa chọn hiện tại</Badge> : null}
            </div>
          </div>
        </div>
        {onSave ? (
          <Button
            variant="secondary"
            className="px-2.5 py-1.5 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
            disabled={saving}
          >
            {saving ? <Spinner /> : "Lưu"}
          </Button>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-slate-50 py-2">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Quãng đường</p>
          <p className="text-sm font-bold text-[#18352B]">{route.distanceKm} km</p>
        </div>
        <div className="rounded-xl bg-slate-50 py-2">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Thời gian</p>
          <p className="text-sm font-bold text-[#18352B]">{Math.round(route.durationMin)} phút</p>
        </div>
        <div className="rounded-xl bg-slate-50 py-2">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">PM2.5 ước tính</p>
          <p className="text-sm font-bold text-[#18352B]">
            {route.pm25Estimate != null ? `${route.pm25Estimate} µg/m³` : "Chưa đủ dữ liệu"}
          </p>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
        {route.extraTimeMin > 0 ? <span>+{Math.round(route.extraTimeMin)} phút so với tuyến nhanh nhất</span> : <span>Không mất thêm thời gian</span>}
        <span>·</span>
        <span>{CONFIDENCE_LABEL[route.confidence]}</span>
        <span>·</span>
        <span>{route.pm25SampleCount} điểm đo lân cận dùng để ước tính</span>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-slate-600">{route.explanation}</p>
    </button>
  );
}
