import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { RouteSearchProvider } from "@/lib/context/route-search-context";

export const metadata: Metadata = {
  title: "GreenLane — Bản đồ chất lượng không khí & Tuyến đường sạch",
  description:
    "GreenLane giúp người đi xe hai bánh tại TP. Hồ Chí Minh so sánh tuyến đường theo thời gian di chuyển và mức phơi nhiễm bụi mịn PM2.5 ước tính.",
  icons: { icon: "/images/logo.png" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="antialiased">
        <RouteSearchProvider>
          <AppShell>{children}</AppShell>
        </RouteSearchProvider>
      </body>
    </html>
  );
}
