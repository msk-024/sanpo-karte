const JUDGMENT_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  A: { bg: "#EAF3DE", color: "#639922", label: "A判定" },
  B: { bg: "#FAECE7", color: "#D85A30", label: "B判定" },
  C: { bg: "#FAEEDA", color: "#EF9F27", label: "C判定" },
  D: { bg: "#FCEBEB", color: "#E24B4A", label: "D判定" },
};

export default function JudgmentBadge({
  judgment,
}: {
  judgment: string | null | undefined;
}) {
  if (!judgment) {
    return (
      <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
        未受診
      </span>
    );
  }

  const style = JUDGMENT_STYLE[judgment];
  if (!style) {
    return <span style={{ fontSize: "12px" }}>{judgment}</span>;
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: "20px",
        background: style.bg,
        color: style.color,
        fontSize: "12px",
        fontWeight: 600,
        letterSpacing: "0.5px",
      }}
    >
      {style.label}
    </span>
  );
}
