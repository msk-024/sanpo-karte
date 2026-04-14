"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import JudgmentBadge from "../../employees/_components/JudgmentBadge";
import DonutChart from "../../_components/DonutChart";

export type HealthCheckRecord = {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_name_kana: string | null;
  department: string | null;
  check_year: number;
  judgment: string;
  bmi: number | null;
  blood_pressure_sys: number | null;
  blood_pressure_dia: number | null;
  blood_sugar: number | null;
  total_cholesterol: number | null;
  notes: string | null;
};

const JUDGMENTS = ["A", "B", "C", "D"] as const;


function fmt(v: number | null, decimals = 0): string {
  if (v == null) return "—";
  return decimals > 0 ? v.toFixed(decimals) : String(v);
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
      }}
    >
      {label}
    </button>
  );
}

export default function HealthCheckList({ records }: { records: HealthCheckRecord[] }) {
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [judgeFilter, setJudgeFilter] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const years = useMemo(() =>
    [...new Set(records.map((r) => r.check_year))].sort((a, b) => b - a),
    [records]
  );

  const departments = useMemo(() =>
    [...new Set(records.map((r) => r.department).filter(Boolean))].sort() as string[],
    [records]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      const matchSearch =
        !q ||
        r.employee_name.toLowerCase().includes(q) ||
        (r.employee_name_kana ?? "").toLowerCase().includes(q) ||
        (r.department ?? "").toLowerCase().includes(q);
      const matchYear = !yearFilter || String(r.check_year) === yearFilter;
      const matchDept = !deptFilter || r.department === deptFilter;
      const matchJudge = !judgeFilter || r.judgment === judgeFilter;
      return matchSearch && matchYear && matchDept && matchJudge;
    });
  }, [records, search, yearFilter, deptFilter, judgeFilter]);

  const counts = useMemo(() => {
    const c = { A: 0, B: 0, C: 0, D: 0 };
    for (const r of filtered) {
      const j = r.judgment as keyof typeof c;
      if (j in c) c[j]++;
    }
    return c;
  }, [filtered]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* 判定サマリー */}
      <div style={{
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        padding: "16px",
        background: "var(--color-background-primary)",
        display: "inline-block",
      }}>
        <DonutChart
          title="判定分布"
          segments={[
            { value: counts.A, color: "#639922", label: "A判定" },
            { value: counts.B, color: "#D85A30", label: "B判定" },
            { value: counts.C, color: "#EF9F27", label: "C判定" },
            { value: counts.D, color: "#E24B4A", label: "D判定" },
          ]}
          centerValue={filtered.length}
          centerLabel="表示中"
        />
      </div>

      {/* フィルターバー */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="氏名・部署で検索"
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
            minWidth: "140px",
          }}
        />

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          style={{
            padding: "7px 10px",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            background: "var(--color-background-primary)",
            color: yearFilter ? "var(--foreground)" : "var(--muted-foreground)",
            cursor: "pointer",
          }}
        >
          <option value="">年度：全て</option>
          {years.map((y) => (
            <option key={y} value={String(y)}>{y}年度</option>
          ))}
        </select>

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

        <div style={{ display: "flex", gap: "4px" }}>
          <FilterButton label="全て" active={judgeFilter === ""} onClick={() => setJudgeFilter("")} />
          {JUDGMENTS.map((j) => (
            <FilterButton key={j} label={j} active={judgeFilter === j} onClick={() => setJudgeFilter(j)} />
          ))}
        </div>
      </div>

      {/* テーブル */}
      <div
        style={{
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          overflow: "hidden",
          background: "var(--color-background-primary)",
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--muted-foreground)", fontSize: "13px" }}>
            該当する健診データが見つかりません
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "720px" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "0.5px solid var(--color-border-tertiary)",
                    background: "var(--color-background-secondary)",
                  }}
                >
                  {["氏名", "部署", "年度", "判定", "BMI", "血圧", "血糖値", "TC", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.3px",
                        color: "var(--muted-foreground)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const isHovered = hoveredId === r.id;
                  const bp =
                    r.blood_pressure_sys != null && r.blood_pressure_dia != null
                      ? `${r.blood_pressure_sys}/${r.blood_pressure_dia}`
                      : r.blood_pressure_sys != null
                      ? String(r.blood_pressure_sys)
                      : "—";
                  return (
                    <tr
                      key={r.id}
                      onMouseEnter={() => setHoveredId(r.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{
                        borderBottom: i < filtered.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none",
                        background: isHovered ? "var(--color-background-secondary)" : "transparent",
                        transition: "background 0.1s",
                      }}
                    >
                      <td style={{ padding: "10px 12px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 500, whiteSpace: "nowrap" }}>{r.employee_name}</p>
                        {r.employee_name_kana && (
                          <p style={{ fontSize: "11px", color: "var(--muted-foreground)", letterSpacing: "0.3px" }}>
                            {r.employee_name_kana}
                          </p>
                        )}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: "13px", color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                        {r.department ?? "—"}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: "13px", whiteSpace: "nowrap" }}>
                        {r.check_year}年度
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <JudgmentBadge judgment={r.judgment} />
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: "13px", color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                        {fmt(r.bmi, 1)}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: "13px", color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                        {bp}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: "13px", color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                        {fmt(r.blood_sugar, 1)}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: "13px", color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                        {fmt(r.total_cholesterol, 1)}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        <Link
                          href={`/employees/${r.employee_id}`}
                          style={{
                            fontSize: "12px",
                            color: "var(--color-text-info)",
                            textDecoration: "none",
                            padding: "4px 12px",
                            border: "0.5px solid var(--color-text-info)",
                            borderRadius: "20px",
                            display: "inline-block",
                            whiteSpace: "nowrap",
                          }}
                        >
                          カルテ
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ fontSize: "12px", color: "var(--muted-foreground)", textAlign: "right" }}>
        {filtered.length} / {records.length} 件表示中
      </p>
    </div>
  );
}
