// Shared, client-safe PM2.5 color scale. This is an illustrative scale for
// GreenLane's UI — it does NOT represent an official Vietnamese or WHO
// regulatory classification. Units are µg/m³ (24h-equivalent instantaneous
// readings in this prototype).
export function pm25Level(pm25: number): {
  key: "good" | "moderate" | "elevated" | "high" | "very-high";
  label: string;
  color: string;
} {
  if (pm25 <= 25) return { key: "good", label: "Thấp tương đối", color: "#27A765" };
  if (pm25 <= 50) return { key: "moderate", label: "Trung bình", color: "#D8C32A" };
  if (pm25 <= 65) return { key: "elevated", label: "Tăng cao", color: "#F2994A" };
  if (pm25 <= 85) return { key: "high", label: "Cao", color: "#E8483A" };
  return { key: "very-high", label: "Rất cao", color: "#7A3AC9" };
}
