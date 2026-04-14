/**
 * 共通スタイル定数
 * インラインスタイルで繰り返し使うCSSプロパティをここで一元管理する
 */

export const CARD_STYLE: React.CSSProperties = {
  border: "0.5px solid var(--color-border-tertiary)",
  borderRadius: "var(--border-radius-lg)",
  padding: "16px",
  background: "var(--color-background-primary)",
};

export const SECTION_TITLE_STYLE: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.3px",
  color: "var(--muted-foreground)",
  marginBottom: "12px",
};
