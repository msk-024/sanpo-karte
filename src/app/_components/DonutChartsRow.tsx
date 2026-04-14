import Link from "next/link";
import DonutChart from "./DonutChart";
import { CARD_STYLE } from "@/lib/styles";

type Segment = { value: number; color: string; label: string };

export type ChartData = {
  title: string;
  segments: Segment[];
  centerValue: string | number;
  centerLabel?: string;
  href?: string;
};

const card: React.CSSProperties = {
  ...CARD_STYLE,
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

export default function DonutChartsRow({ charts }: { charts: ChartData[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "12px",
      }}
    >
      {charts.map((chart, i) => (
        <div key={i} style={card}>
          <DonutChart
            title={chart.title}
            segments={chart.segments}
            centerValue={chart.centerValue}
            centerLabel={chart.centerLabel}
          />
          {chart.href && (
            <Link
              href={chart.href}
              style={{
                fontSize: "11px",
                color: "var(--color-text-info)",
                textDecoration: "none",
                textAlign: "right",
              }}
            >
              詳細を見る →
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
