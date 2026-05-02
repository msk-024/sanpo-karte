type Segment = {
  value: number;
  color: string;
  label: string;
};

const R = 38;
const SW = 13;
const C = 2 * Math.PI * R; // ≈ 238.76

export default function DonutChart({
  title,
  segments,
  centerValue,
  centerLabel,
}: {
  title: string;
  segments: Segment[];
  centerValue: string | number;
  centerLabel?: string;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  let cumOffset = 0;
  const arcs = segments.map((seg) => {
    const len = total > 0 ? (seg.value / total) * C : 0;
    const arc = { ...seg, len, dashOffset: cumOffset };
    cumOffset += len;
    return arc;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <p
        style={{
          fontSize: "11px",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.3px",
          color: "var(--muted-foreground)",
        }}
      >
        {title}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <svg viewBox="0 0 100 100" width="120" height="120" style={{ flexShrink: 0 }}>
          {/* トラック（背景） */}
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={SW}
          />
          {/* セグメント */}
          {total === 0
            ? null
            : arcs.map((arc, i) =>
                arc.len === 0 ? null : (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r={R}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth={SW}
                    strokeDasharray={`${arc.len} ${C}`}
                    strokeDashoffset={arc.dashOffset}
                    transform="rotate(-90, 50, 50)"
                    strokeLinecap="butt"
                  />
                )
              )}
          {/* 中央テキスト */}
          <text
            x="50"
            y={centerLabel ? "44" : "50"}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="18"
            fontWeight="600"
            fill="var(--foreground)"
          >
            {centerValue}
          </text>
          {centerLabel && (
            <text
              x="50"
              y="61"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fill="var(--muted-foreground)"
            >
              {centerLabel}
            </text>
          )}
        </svg>

        {/* 凡例 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {segments.map((seg, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: seg.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "11px", color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                {seg.label}
              </span>
              <span style={{ fontSize: "12px", fontWeight: 600, marginLeft: "4px" }}>{seg.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
