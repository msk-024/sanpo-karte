"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DonutChart from "../../_components/DonutChart";
import { formatDate } from "@/lib/utils";

export type InterviewRecord = {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_name_kana: string | null;
  department: string | null;
  interviewed_at: string;
  interview_type: string;
  content: string;
  plan: string | null;
  created_at: string;
};

const TYPE_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  routine:  { label: "定期面談",         bg: "#EAF3DE", color: "#639922" },
  mental:   { label: "メンタル相談",     bg: "#FCEBEB", color: "#E24B4A" },
  referral: { label: "受診勧奨後フォロー", bg: "#FAEEDA", color: "#EF9F27" },
  other:    { label: "その他",           bg: "var(--color-background-secondary)", color: "var(--muted-foreground)" },
};

const TYPE_KEYS = ["routine", "mental", "referral", "other"] as const;

function TypeBadge({ type }: { type: string }) {
  const s = TYPE_STYLE[type] ?? TYPE_STYLE.other;
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 500,
        background: s.bg,
        color: s.color,
        padding: "2px 8px",
        borderRadius: "20px",
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 10px",
        borderRadius: "20px",
        border: "0.5px solid var(--color-border-tertiary)",
        background: active ? "var(--foreground)" : "transparent",
        color: active ? "var(--background)" : "var(--muted-foreground)",
        fontSize: "12px",
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

export default function InterviewRecordList({ records }: { records: InterviewRecord[] }) {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const departments = useMemo(() =>
    [...new Set(records.map((r) => r.department).filter(Boolean))].sort() as string[],
    [records]
  );

  const typeCounts = useMemo(() => {
    const c: Record<string, number> = { routine: 0, mental: 0, referral: 0, other: 0 };
    for (const r of records) {
      const k = r.interview_type in c ? r.interview_type : "other";
      c[k]++;
    }
    return c;
  }, [records]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      const matchSearch =
        !q ||
        r.employee_name.toLowerCase().includes(q) ||
        (r.employee_name_kana ?? "").toLowerCase().includes(q) ||
        (r.department ?? "").toLowerCase().includes(q) ||
        r.content.toLowerCase().includes(q);
      const matchDept = !deptFilter || r.department === deptFilter;
      const matchType = !typeFilter || r.interview_type === typeFilter;
      return matchSearch && matchDept && matchType;
    });
  }, [records, search, deptFilter, typeFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: 0 }}>
      {/* 種別サマリー */}
      <div style={{
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        padding: "16px",
        background: "var(--color-background-primary)",
        display: "inline-block",
      }}>
        <DonutChart
          title="面談種別"
          segments={[
            { value: typeCounts.routine,  color: "#639922", label: "定期面談" },
            { value: typeCounts.mental,   color: "#E24B4A", label: "メンタル相談" },
            { value: typeCounts.referral, color: "#EF9F27", label: "受診勧奨後フォロー" },
            { value: typeCounts.other,    color: "#94A3B8", label: "その他" },
          ]}
          centerValue={records.length}
          centerLabel="合計"
        />
      </div>

      {/* フィルターバー */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", minWidth: 0 }}>
        <input
          type="text"
          placeholder="氏名・部署・内容で検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1 1 180px",
            padding: "7px 12px",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            background: "var(--color-background-primary)",
            outline: "none",
            minWidth: 0,
          }}
        />
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          style={{
            padding: "7px 10px",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            background: "var(--color-background-primary)",
            color: deptFilter ? "var(--foreground)" : "var(--muted-foreground)",
            cursor: "pointer",
          }}
        >
          <option value="">部署：全て</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          <FilterButton label="全て" active={typeFilter === ""} onClick={() => setTypeFilter("")} />
          {TYPE_KEYS.map((k) => (
            <FilterButton
              key={k}
              label={TYPE_STYLE[k].label}
              active={typeFilter === k}
              onClick={() => setTypeFilter(k)}
            />
          ))}
        </div>
      </div>

      {/* カードリスト */}
      {filtered.length === 0 ? (
        <div
          style={{
            padding: "48px",
            textAlign: "center",
            color: "var(--muted-foreground)",
            fontSize: "13px",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            background: "var(--color-background-primary)",
          }}
        >
          該当する面談記録が見つかりません
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {filtered.map((r) => {
            const isExpanded = expandedId === r.id;
            return (
              <div
                key={r.id}
                style={{
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--border-radius-lg)",
                  background: "var(--color-background-primary)",
                  overflow: "hidden",
                }}
              >
                {/* ヘッダー行 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    cursor: "pointer",
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                >
                  <div style={{ width: "120px", flexShrink: 0 }}>
                    <TypeBadge type={r.interview_type} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "13px", fontWeight: 500 }}>{r.employee_name}</span>
                      {r.employee_name_kana && (
                        <span style={{ fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.3px" }}>
                          {r.employee_name_kana}
                        </span>
                      )}
                      {r.department && (
                        <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                          {r.department}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--muted-foreground)",
                        marginTop: "2px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: isExpanded ? "normal" : "nowrap",
                      }}
                    >
                      {r.content}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                    <span style={{ fontSize: "12px", color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                      {formatDate(r.interviewed_at)}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* 展開エリア */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop: "0.5px solid var(--color-border-tertiary)",
                      padding: "12px 16px",
                      background: "var(--color-background-secondary)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "11px", fontWeight: 500, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: "4px" }}>
                        面談内容
                      </p>
                      <p style={{ fontSize: "13px", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{r.content}</p>
                    </div>
                    {r.plan && (
                      <div>
                        <p style={{ fontSize: "11px", fontWeight: 500, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: "4px" }}>
                          今後の方針・対応
                        </p>
                        <p style={{ fontSize: "13px", lineHeight: 1.7, whiteSpace: "pre-wrap", borderLeft: "2px solid var(--color-border-tertiary)", paddingLeft: "10px" }}>
                          {r.plan}
                        </p>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <Link
                        href={`/employees/${r.employee_id}`}
                        style={{
                          fontSize: "12px",
                          color: "var(--color-text-info)",
                          textDecoration: "none",
                          padding: "4px 14px",
                          border: "0.5px solid var(--color-text-info)",
                          borderRadius: "20px",
                        }}
                      >
                        カルテを見る
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p style={{ fontSize: "12px", color: "var(--muted-foreground)", textAlign: "right" }}>
        {filtered.length} / {records.length} 件表示中
      </p>
    </div>
  );
}
