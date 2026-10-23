"use client";

import { useEffect, useRef, useState } from "react";
import type { RoutePoint } from "@/lib/types";

interface GeocodeResult {
  label: string;
  lat: number;
  lng: number;
}

export function LocationInput({
  placeholder,
  value,
  onSelect,
  accent = "#27A765",
}: {
  placeholder: string;
  value: RoutePoint | null;
  onSelect: (point: RoutePoint | null) => void;
  accent?: string;
}) {
  const [query, setQuery] = useState(value?.label ?? "");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value?.label ?? "");
  }, [value]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.length < 3 || query === value?.label) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setResults(data.results ?? []);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="relative" ref={boxRef}>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus-within:border-[#27A765]">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: accent }} />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (value) onSelect(null);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full min-w-0 text-sm outline-none placeholder:text-slate-400"
        />
        {loading ? <span className="text-xs text-slate-400">…</span> : null}
      </div>
      {open && results.length > 0 ? (
        <ul className="absolute z-[1200] mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg gl-scrollbar">
          {results.map((r, i) => (
            <li key={`${r.lat}-${r.lng}-${i}`}>
              <button
                type="button"
                onClick={() => {
                  onSelect({ label: r.label, lat: r.lat, lng: r.lng });
                  setQuery(r.label);
                  setOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-[#F6F9F7]"
              >
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {open && !loading && query.length >= 3 && results.length === 0 && query !== value?.label ? (
        <div className="absolute z-[1200] mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-400 shadow-lg">
          Không tìm thấy địa điểm phù hợp.
        </div>
      ) : null}
    </div>
  );
}
