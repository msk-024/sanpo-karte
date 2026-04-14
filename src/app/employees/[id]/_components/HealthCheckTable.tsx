import JudgmentBadge from "../../_components/JudgmentBadge";

export type HealthCheck = {
  id: string;
  check_year: number;
  bmi: number | null;
  blood_pressure_sys: number | null;
  blood_pressure_dia: number | null;
  blood_sugar: number | null;
  total_cholesterol: number | null;
  judgment: string | null;
  notes: string | null;
};

export default function HealthCheckTable({
  healthChecks,
}: {
  healthChecks: HealthCheck[];
}) {
  if (healthChecks.length === 0) {
    return (
      <p
        style={{
          fontSize: "13px",
          color: "var(--muted-foreground)",
          padding: "16px 0",
        }}
      >
        健診データがまだありません
      </p>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr
            style={{
              borderBottom: "0.5px solid var(--color-border-tertiary)",
              background: "var(--color-background-secondary)",
            }}
          >
            {(
              [
                "実施年度",
                "判定",
                "BMI",
                "血圧（収/拡）",
                "血糖値",
                "総コレステロール",
                "備考",
              ] as const
            ).map((h) => (
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
          {healthChecks.map((hc, i) => (
            <tr
              key={hc.id}
              style={{
                borderBottom:
                  i < healthChecks.length - 1
                    ? "0.5px solid var(--color-border-tertiary)"
                    : "none",
              }}
            >
              <td
                style={{
                  padding: "10px 12px",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                {hc.check_year}年度
              </td>
              <td style={{ padding: "10px 12px" }}>
                <JudgmentBadge judgment={hc.judgment} />
              </td>
              <td
                style={{
                  padding: "10px 12px",
                  fontSize: "13px",
                  color: "var(--muted-foreground)",
                }}
              >
                {hc.bmi != null ? hc.bmi.toFixed(1) : "—"}
              </td>
              <td
                style={{
                  padding: "10px 12px",
                  fontSize: "13px",
                  color: "var(--muted-foreground)",
                }}
              >
                {hc.blood_pressure_sys != null && hc.blood_pressure_dia != null
                  ? `${hc.blood_pressure_sys} / ${hc.blood_pressure_dia}`
                  : "—"}
              </td>
              <td
                style={{
                  padding: "10px 12px",
                  fontSize: "13px",
                  color: "var(--muted-foreground)",
                }}
              >
                {hc.blood_sugar != null ? `${hc.blood_sugar} mg/dL` : "—"}
              </td>
              <td
                style={{
                  padding: "10px 12px",
                  fontSize: "13px",
                  color: "var(--muted-foreground)",
                }}
              >
                {hc.total_cholesterol != null
                  ? `${hc.total_cholesterol} mg/dL`
                  : "—"}
              </td>
              <td
                style={{
                  padding: "10px 12px",
                  fontSize: "13px",
                  color: "var(--muted-foreground)",
                  maxWidth: "200px",
                }}
              >
                {hc.notes ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
