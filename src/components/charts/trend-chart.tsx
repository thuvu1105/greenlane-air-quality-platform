"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { TrendPoint } from "@/lib/types";

export function TrendChart({ points, color = "#27A765", unit = "µg/m³" }: { points: TrendPoint[]; color?: string; unit?: string }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={points} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2ef" />
        <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
        <YAxis tick={{ fontSize: 10 }} unit={` ${unit}`} width={60} />
        <Tooltip formatter={(value) => [`${value} ${unit}`, "PM2.5"]} labelFormatter={(l) => `Giờ ${l}`} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="pm25" name="PM2.5 (mẫu)" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
