import type { Metadata } from "next";
import SettingsForm from "./_components/SettingsForm";

export const metadata: Metadata = {
  title: "設定 | さんぽかるて",
};

export default function SettingsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <h1 style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.3px" }}>
          設定
        </h1>
        <p style={{ fontSize: "13px", color: "var(--muted-foreground)", marginTop: "2px" }}>
          事業所・担当者情報と動作設定
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}
