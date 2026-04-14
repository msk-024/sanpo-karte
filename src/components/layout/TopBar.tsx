import Link from "next/link";

export default function TopBar() {
  return (
    <header
      style={{
        height: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        background: "var(--color-background-primary)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <Link href="/" style={{ textDecoration: "none" }}>
        <span
          style={{
            fontWeight: 600,
            fontSize: "16px",
            letterSpacing: "-0.3px",
            color: "var(--foreground)",
          }}
        >
          さんぽ
          <span style={{ color: "var(--color-text-info)" }}>かるて</span>
        </span>
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            color: "var(--muted-foreground)",
          }}
        >
          保健師 太郎
        </span>
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "var(--color-background-info)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--color-text-info)",
          }}
        >
          保
        </div>
      </div>
    </header>
  );
}
