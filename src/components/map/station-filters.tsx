"use client";

export interface StationFilterState {
  minPm25: number;
  freshness: "all" | "recent" | "stale";
  sourceType: "all" | "simulated" | "estimated";
}

const PM_PRESETS: { label: string; value: number }[] = [
  { label: "Tất cả", value: 0 },
  { label: "≥ 50", value: 50 },
  { label: "≥ 65", value: 65 },
  { label: "≥ 85", value: 85 },
];

export function StationFilters({
  value,
  onChange,
}: {
  value: StationFilterState;
  onChange: (next: StationFilterState) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Mức PM2.5</p>
        <div className="flex flex-wrap gap-1.5">
          {PM_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => onChange({ ...value, minPm25: preset.value })}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                value.minPm25 === preset.value ? "bg-[#27A765] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Độ mới của dữ liệu</p>
        <div className="flex flex-wrap gap-1.5">
          {[
            { v: "all", label: "Tất cả" },
            { v: "recent", label: "Còn mới (&le;60p)" },
            { v: "stale", label: "Đã cũ (&gt;60p)" },
          ].map((opt) => (
            <button
              key={opt.v}
              onClick={() => onChange({ ...value, freshness: opt.v as StationFilterState["freshness"] })}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                value.freshness === opt.v ? "bg-[#249CF4] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              dangerouslySetInnerHTML={{ __html: opt.label }}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Nguồn dữ liệu</p>
        <div className="flex flex-wrap gap-1.5">
          {[
            { v: "all", label: "Tất cả" },
            { v: "simulated", label: "Mô phỏng" },
            { v: "estimated", label: "Ước tính nội suy" },
          ].map((opt) => (
            <button
              key={opt.v}
              onClick={() => onChange({ ...value, sourceType: opt.v as StationFilterState["sourceType"] })}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                value.sourceType === opt.v ? "bg-[#8A6DD1] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
