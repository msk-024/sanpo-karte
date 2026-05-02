export type YearRow = {
  year: number;
  total: number;
  A: number;
  B: number;
  C: number;
  D: number;
};

const SEGMENTS = [
  { key: "A", color: "#639922", label: "A判定" },
  { key: "B", color: "#D85A30", label: "B判定" },
  { key: "C", color: "#EF9F27", label: "C判定" },
  { key: "D", color: "#E24B4A", label: "D判定" },
] as const;

export default function YearTrend({ rows }: { rows: YearRow[] }) {
  if (rows.length === 0) {
    return <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>データがありません</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* 凡例 */}
      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
        {SEGMENTS.map((s) => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* 年度ごとの行 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {[...rows].reverse().map((row) => (
          <div key={row.year} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* 年度ラベル */}
            <span style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--muted-foreground)",
              whiteSpace: "nowrap",
              width: "60px",
              textAlign: "right",
              flexShrink: 0,
            }}>
              {row.year}年度
            </span>

            {/* 積み上げ棒（全幅・判定割合） */}
            <div style={{
              flex: 1,
              height: "24px",
              borderRadius: "4px",
              overflow: "hidden",
              display: "flex",
              background: "#E5E7EB",
            }}>
              {SEGMENTS.map((s) => {
                const count = row[s.key];
                if (count === 0) return null;
                const pct = (count / row.total) * 100;
                return (
                  <div
                    key={s.key}
                    title={`${s.label}：${count}件（${Math.round(pct)}%）`}
                    style={{ width: `${pct}%`, background: s.color, flexShrink: 0 }}
                  />
                );
              })}
            </div>

            {/* 件数内訳（固定幅） */}
            <div style={{
              display: "flex",
              gap: "6px",
              fontSize: "11px",
              flexShrink: 0,
              width: "160px",
            }}>
              {SEGMENTS.map((s) =>
                row[s.key] > 0 ? (
                  <span key={s.key} style={{ color: s.color, fontWeight: 600, whiteSpace: "nowrap" }}>
                    {s.key}:{row[s.key]}
                  </span>
                ) : null
              )}
              <span style={{ color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                計{row.total}件
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
