"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";

const NAV_ITEMS = [
  { href: "/", label: "Bản đồ", icon: "🗺️" },
  { href: "/tuyen-duong", label: "Tuyến đường", icon: "🛣️" },
  { href: "/canh-bao", label: "Cảnh báo", icon: "🔔" },
  { href: "/diem-xanh", label: "Điểm xanh", icon: "🌱" },
  { href: "/ve-du-lieu", label: "Về dữ liệu", icon: "📊" },
  { href: "/cai-dat", label: "Cài đặt", icon: "⚙️" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((item) => item.href === pathname) ?? NAV_ITEMS[0];

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[#F6F9F7]">
      {/* Desktop sidebar */}
      <aside className="hidden w-[232px] shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="px-5 py-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active = item.href === pathname;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-[#E6F6EC] text-[#116B45]" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mx-3 mb-5 rounded-xl bg-[#EAF6FF] p-3 text-[11px] leading-relaxed text-[#1668A3]">
          Dữ liệu PM2.5 hiển thị là <strong>dữ liệu mô phỏng</strong> dùng để minh họa sản phẩm, chưa phải số đo cảm biến thực tế.
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <Logo size={30} />
          <span className="rounded-full bg-[#E6F6EC] px-3 py-1 text-xs font-semibold text-[#116B45]">
            {current.icon} {current.label}
          </span>
        </header>

        <main className="relative min-h-0 flex-1 overflow-hidden">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="grid grid-cols-6 border-t border-slate-200 bg-white md:hidden">
          {NAV_ITEMS.map((item) => {
            const active = item.href === pathname;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
                  active ? "text-[#116B45]" : "text-slate-500"
                }`}
              >
                <span className={`text-base ${active ? "" : "opacity-70"}`}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
