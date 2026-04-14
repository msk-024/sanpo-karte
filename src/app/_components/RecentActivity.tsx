import { CARD_STYLE, SECTION_TITLE_STYLE } from "@/lib/styles";

export type Activity = {
  text: string;
  time: string;
};

export default function RecentActivity({ activities }: { activities: Activity[] }) {
  return (
    <div style={CARD_STYLE}>
      <p style={SECTION_TITLE_STYLE}>最近の活動</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {activities.map((act, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "7px 0",
              borderBottom:
                i < activities.length - 1
                  ? "0.5px solid var(--color-border-tertiary)"
                  : "none",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--color-border-tertiary)",
                flexShrink: 0,
              }}
            />
            <p style={{ fontSize: "13px", flex: 1 }}>{act.text}</p>
            <span style={{ fontSize: "11px", color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
              {act.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
