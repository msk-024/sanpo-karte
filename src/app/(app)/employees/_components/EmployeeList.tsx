"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import JudgmentBadge from "./JudgmentBadge";
import { calcAge } from "@/lib/utils";

export type Employee = {
  id: string;
  name: string;
  name_kana: string | null;
  department: string | null;
  birth_date: string | null;
  gender: string | null;
  created_at: string;
  latest_judgment: string | null;
};

const GENDER_LABEL: Record<string, string> = {
  male: "男性",
  female: "女性",
  other: "その他",
};


const JUDGMENTS = ["A", "B", "C", "D"] as const;

type DupeTag = "同姓同名あり" | "同姓あり" | "同名あり" | null;

function getDupeTag(emp: Employee, others: Employee[]): DupeTag {
  const [family, given] = emp.name.split(/\s+/);
  if (others.some((o) => o.name === emp.name)) return "同姓同名あり";
  const sameFamily = family ? others.some((o) => o.name.split(/\s+/)[0] === family) : false;
  const sameGiven = given ? others.some((o) => o.name.split(/\s+/)[1] === given) : false;
  if (sameFamily) return "同姓あり";
  if (sameGiven) return "同名あり";
  return null;
}

export default function EmployeeList({
  employees,
}: {
  employees: Employee[];
}) {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [judgeFilter, setJudgeFilter] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const dupeTags = useMemo(() => {
    const map = new Map<string, DupeTag>();
    for (const emp of employees) {
      const others = employees.filter((e) => e.id !== emp.id);
      map.set(emp.id, getDupeTag(emp, others));
    }
    return map;
  }, [employees]);

  const departments = useMemo(
    () =>
      [...new Set(employees.map((e) => e.department).filter(Boolean))].sort() as string[],
    [employees]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((emp) => {
      const matchSearch =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        (emp.name_kana ?? "").toLowerCase().includes(q) ||
        (emp.department ?? "").toLowerCase().includes(q);
      const matchDept = !deptFilter || emp.department === deptFilter;
      const matchJudge = !judgeFilter || emp.latest_judgment === judgeFilter;
      return matchSearch && matchDept && matchJudge;
    });
  }, [employees, search, deptFilter, judgeFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* フィルターバー */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="名前・部署で検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1 1 200px",
            padding: "7px 12px",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            background: "var(--color-background-primary)",
            outline: "none",
            minWidth: "160px",
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
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* 判定フィルター */}
        <div style={{ display: "flex", gap: "4px" }}>
          <FilterButton
            label="全て"
            active={judgeFilter === ""}
            onClick={() => setJudgeFilter("")}
          />
          {JUDGMENTS.map((j) => (
            <FilterButton
              key={j}
              label={j}
              active={judgeFilter === j}
              onClick={() => setJudgeFilter(j)}
            />
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
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "var(--muted-foreground)",
              fontSize: "13px",
            }}
          >
            該当する従業員が見つかりません
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  borderBottom: "0.5px solid var(--color-border-tertiary)",
                  background: "var(--color-background-secondary)",
                }}
              >
                {(["氏名", "部署", "性別", "年齢", "最新判定", ""] as const).map(
                  (h) => (
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
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, i) => {
                const isHovered = hoveredId === emp.id;
                const age = calcAge(emp.birth_date);
                return (
                  <tr
                    key={emp.id}
                    onMouseEnter={() => setHoveredId(emp.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      borderBottom:
                        i < filtered.length - 1
                          ? "0.5px solid var(--color-border-tertiary)"
                          : "none",
                      background: isHovered
                        ? "var(--color-background-secondary)"
                        : "transparent",
                      transition: "background 0.1s",
                    }}
                  >
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "13px", fontWeight: 500 }}>{emp.name}</span>
                        {dupeTags.get(emp.id) && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 500,
                              background: "#FAEEDA",
                              color: "#C07A00",
                              padding: "1px 6px",
                              borderRadius: "20px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {dupeTags.get(emp.id)}
                          </span>
                        )}
                      </div>
                      {emp.name_kana && (
                        <p style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: "1px", letterSpacing: "0.3px" }}>
                          {emp.name_kana}
                        </p>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: "13px",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {emp.department ?? "—"}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: "13px",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {emp.gender ? (GENDER_LABEL[emp.gender] ?? emp.gender) : "—"}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: "13px",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {age !== null ? `${age}歳` : "—"}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <JudgmentBadge judgment={emp.latest_judgment} />
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <Link
                        href={`/employees/${emp.id}`}
                        style={{
                          fontSize: "12px",
                          color: "var(--color-text-info)",
                          textDecoration: "none",
                          padding: "4px 12px",
                          border: "0.5px solid var(--color-text-info)",
                          borderRadius: "20px",
                          display: "inline-block",
                          transition: "all 0.15s",
                        }}
                      >
                        カルテを見る
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* フッター：件数表示 */}
      <p
        style={{
          fontSize: "12px",
          color: "var(--muted-foreground)",
          textAlign: "right",
        }}
      >
        {filtered.length} / {employees.length} 名表示中
      </p>
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
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
