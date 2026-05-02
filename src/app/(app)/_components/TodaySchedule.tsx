import Link from "next/link";
import { CARD_STYLE, SECTION_TITLE_STYLE } from "@/lib/styles";

export type Interview = {
  time?: string;
  name: string;
  reason: string;
  id: string;
};

export default function TodaySchedule({ interviews }: { interviews: Interview[] }) {
  return (
    <div style={CARD_STYLE}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
        <p style={{ ...SECTION_TITLE_STYLE, marginBottom: 0 }}>今日の面談予定</p>
        <Link href="/interviews" style={{ fontSize: "11px", color: "var(--color-text-info)", textDecoration: "none" }}>
          全履歴を見る →
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {interviews.map((iv) => (
          <Link
            key={iv.id}
            href={`/employees/${iv.id}`}
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
            {iv.time && (
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  background: "var(--color-background-info)",
                  color: "var(--color-text-info)",
                  padding: "2px 8px",
                  borderRadius: "20px",
                  whiteSpace: "nowrap",
                }}
              >
                {iv.time}
              </span>
            )}
            <div>
              <p style={{ fontSize: "13px", fontWeight: 500 }}>{iv.name}</p>
              {iv.reason && (
                <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                  {iv.reason}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
