export type DeptRow = {
  dept: string;
  total: number;
  A: number;
  B: number;
  C: number;
  D: number;
  none: number;
};

const JUDGMENT_COLOR: Record<string, string> = {
  A: "#639922",
  B: "#D85A30",
  C: "#EF9F27",
  D: "#E24B4A",
};

function StackedBar({ row }: { row: DeptRow }) {
  const segments = [
    { key: "A", count: row.A },
    { key: "B", count: row.B },
    { key: "C", count: row.C },
    { key: "D", count: row.D },
    { key: "none", count: row.none },
  ].filter((s) => s.count > 0);

  return (
    <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden", gap: "1px" }}>
      {segments.map((s) => (
        <div
          key={s.key}
          title={`${s.key === "none" ? "未入力" : s.key + "判定"}：${s.count}名`}
          style={{
            flex: s.count,
            background: JUDGMENT_COLOR[s.key] ?? "#E5E7EB",
            minWidth: "2px",
          }}
        />
      ))}
    </div>
  );
}

function Cell({ value, color }: { value: number; color?: string }) {
  return (
    <td style={{ padding: "10px 12px", fontSize: "13px", textAlign: "center", color: value > 0 ? (color ?? "var(--foreground)") : "var(--muted-foreground)", fontWeight: value > 0 ? 500 : 400 }}>
      {value > 0 ? value : "—"}
    </td>
  );
}

export default function DeptBreakdown({ rows }: { rows: DeptRow[] }) {
  if (rows.length === 0) {
    return <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>データがありません</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "560px" }}>
        <thead>
          <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
            {["部署", "総数", "A", "B", "C", "D", "未入力", "分布"].map((h, i) => (
              <th
                key={h}
                style={{
                  padding: "6px 12px",
                  textAlign: i === 0 ? "left" : "center",
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
          {rows.map((row, i) => (
            <tr
              key={row.dept}
              style={{ borderBottom: i < rows.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}
            >
              <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 500, whiteSpace: "nowrap" }}>
                {row.dept}
              </td>
              <td style={{ padding: "10px 12px", fontSize: "13px", textAlign: "center", fontWeight: 600 }}>
                {row.total}
              </td>
              <Cell value={row.A} color={JUDGMENT_COLOR.A} />
              <Cell value={row.B} color={JUDGMENT_COLOR.B} />
              <Cell value={row.C} color={JUDGMENT_COLOR.C} />
              <Cell value={row.D} color={JUDGMENT_COLOR.D} />
              <Cell value={row.none} />
              <td style={{ padding: "10px 12px", minWidth: "100px" }}>
                <StackedBar row={row} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
