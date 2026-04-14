import { formatDate } from "@/lib/utils";

export type Interview = {
  id: string;
  interviewed_at: string;
  interview_type: string;
  content: string;
  plan: string | null;
  created_at: string;
};

const TYPE_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  routine:  { label: "定期面談",       color: "#378ADD", bg: "#E6F1FB" },
  mental:   { label: "メンタル相談",   color: "#EF9F27", bg: "#FAEEDA" },
  referral: { label: "受診勧奨後",     color: "#E24B4A", bg: "#FCEBEB" },
  other:    { label: "その他",         color: "#639922", bg: "#EAF3DE" },
};


export default function InterviewList({
  interviews,
}: {
  interviews: Interview[];
}) {
  if (interviews.length === 0) {
    return (
      <p style={{ fontSize: "13px", color: "var(--muted-foreground)", padding: "8px 0" }}>
        面談記録がまだありません
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {interviews.map((iv, i) => {
        const typeStyle = TYPE_STYLE[iv.interview_type] ?? TYPE_STYLE.other;
        return (
          <div
            key={iv.id}
            style={{
              borderBottom:
                i < interviews.length - 1
                  ? "0.5px solid var(--color-border-tertiary)"
                  : "none",
              paddingBottom: i < interviews.length - 1 ? "10px" : 0,
            }}
          >
            {/* ヘッダー行 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "2px 10px",
                  borderRadius: "20px",
                  background: typeStyle.bg,
                  color: typeStyle.color,
                  flexShrink: 0,
                }}
              >
                {typeStyle.label}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--muted-foreground)",
                }}
              >
                {formatDate(iv.interviewed_at)}
              </span>
            </div>

            {/* 内容 */}
            <p
              style={{
                fontSize: "13px",
                lineHeight: 1.7,
                color: "var(--foreground)",
                margin: 0,
              }}
            >
              {iv.content}
            </p>

            {/* 方針 */}
            {iv.plan && (
              <p
                style={{
                  fontSize: "12px",
                  lineHeight: 1.6,
                  color: "var(--muted-foreground)",
                  marginTop: "4px",
                  paddingLeft: "10px",
                  borderLeft: "2px solid var(--color-border-tertiary)",
                }}
              >
                <span style={{ fontWeight: 500 }}>方針：</span>
                {iv.plan}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
