"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDateSlash } from "@/lib/utils";

export type FollowUpEmployee = {
  id: string;
  name: string;
  name_kana: string | null;
  department: string | null;
  judgment: string;
  last_interview_date: string | null;
  days_since_interview: number | null;
};

const JUDGMENT_STYLE: Record<string, { bg: string; color: string }> = {
  C: { bg: "#FAEEDA", color: "#EF9F27" },
  D: { bg: "#FCEBEB", color: "#E24B4A" },
};

function UrgencyBadge({ days }: { days: number | null }) {
  if (days === null) {
    return (
      <span style={{ fontSize: "11px", fontWeight: 600, background: "#FCEBEB", color: "#E24B4A", padding: "2px 8px", borderRadius: "20px", whiteSpace: "nowrap" }}>
        面談未実施
      </span>
    );
  }
  const bg = days >= 60 ? "#FCEBEB" : days >= 30 ? "#FAEEDA" : "#EAF3DE";
  const color = days >= 60 ? "#E24B4A" : days >= 30 ? "#EF9F27" : "#639922";
  return (
    <span style={{ fontSize: "11px", fontWeight: 600, background: bg, color, padding: "2px 8px", borderRadius: "20px", whiteSpace: "nowrap" }}>
      {days}日経過
    </span>
  );
}


export default function FollowUpList({ employees }: { employees: FollowUpEmployee[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (employees.length === 0) {
    return (
      <p style={{ fontSize: "13px", color: "var(--muted-foreground)", padding: "16px 0" }}>
        要フォロー者はいません
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {employees.map((emp) => {
        const js = JUDGMENT_STYLE[emp.judgment] ?? JUDGMENT_STYLE.C;
        const isHovered = hoveredId === emp.id;
        return (
          <div
            key={emp.id}
            onMouseEnter={() => setHoveredId(emp.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 12px",
              borderRadius: "var(--radius-md)",
              background: isHovered ? "var(--color-background-secondary)" : "transparent",
              transition: "background 0.1s",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 700, background: js.bg, color: js.color, padding: "2px 8px", borderRadius: "20px", whiteSpace: "nowrap" }}>
              {emp.judgment}判定
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: 500 }}>{emp.name}</span>
                {emp.name_kana && (
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.3px" }}>{emp.name_kana}</span>
                )}
              </div>
              {emp.department && (
                <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{emp.department}</span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
              <span style={{ fontSize: "11px", color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                最終面談：{emp.last_interview_date ? formatDateSlash(emp.last_interview_date) : "—"}
              </span>
              <UrgencyBadge days={emp.days_since_interview} />
              <Link
                href={`/employees/${emp.id}`}
                style={{ fontSize: "12px", color: "var(--color-text-info)", textDecoration: "none", padding: "4px 12px", border: "0.5px solid var(--color-text-info)", borderRadius: "20px", whiteSpace: "nowrap" }}
              >
                カルテ
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
