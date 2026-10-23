const LEVELS = [
  { color: "#27A765", label: "Thấp tương đối", range: "0–25" },
  { color: "#D8C32A", label: "Trung bình", range: "26–50" },
  { color: "#F2994A", label: "Tăng cao", range: "51–65" },
  { color: "#E8483A", label: "Cao", range: "66–85" },
  { color: "#7A3AC9", label: "Rất cao", range: "> 85" },
];

export function Legend({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        PM2.5 (µg/m³) — thang minh họa, không phải quy chuẩn chính thức
      </p>
      <div className={compact ? "flex flex-wrap gap-2" : "space-y-1.5"}>
        {LEVELS.map((lvl) => (
          <div key={lvl.label} className="flex items-center gap-2 text-xs text-slate-600">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: lvl.color }} />
            <span className="font-medium text-[#18352B]">{lvl.label}</span>
            <span className="text-slate-400">({lvl.range})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
