import Link from "next/link";
import { CARD_STYLE, SECTION_TITLE_STYLE } from "@/lib/styles";

export type Alert = {
  level: "danger" | "warning";
  name: string;
  reason: string;
  days: number | null;
  id: string;
};

export default function AlertPanel({ alerts }: { alerts: Alert[] }) {
  return (
    <div style={CARD_STYLE}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
        <p style={{ ...SECTION_TITLE_STYLE, marginBottom: 0 }}>要対応アラート</p>
        <Link href="/reports" style={{ fontSize: "11px", color: "var(--color-text-info)", textDecoration: "none" }}>
          レポートを見る →
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {alerts.map((alert) => {
          const isDanger = alert.level === "danger";
          const dotColor = isDanger ? "#E24B4A" : "#EF9F27";
          const badgeBg = isDanger ? "#FCEBEB" : "#FAEEDA";
          const badgeColor = isDanger ? "#E24B4A" : "#EF9F27";
          return (
            <Link
              key={alert.id}
              href={`/employees/${alert.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                color: "var(--foreground)",
                transition: "background 0.15s",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: dotColor,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 500 }}>{alert.name}</p>
                <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                  {alert.reason}
                </p>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  background: badgeBg,
                  color: badgeColor,
                  padding: "2px 8px",
                  borderRadius: "20px",
                  whiteSpace: "nowrap",
                }}
              >
                {alert.days != null ? `${alert.days}日` : "未実施"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
