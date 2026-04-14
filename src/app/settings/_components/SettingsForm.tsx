"use client";

import { useEffect, useState } from "react";
import { CARD_STYLE, SECTION_TITLE_STYLE } from "@/lib/styles";

export const SETTINGS_KEY = "sanpo-karte-settings";

export type AppSettings = {
  officeName: string;
  nurseName: string;
  phone: string;
  followUpDays: number;
  docSignature: string;
  alertJudgments: string[];
};

export const DEFAULT_SETTINGS: AppSettings = {
  officeName: "",
  nurseName: "",
  phone: "",
  followUpDays: 90,
  docSignature: "",
  alertJudgments: ["C", "D"],
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// ── スタイル定数 ──────────────────────────────────────

const card: React.CSSProperties = { ...CARD_STYLE, padding: "20px" };

const sectionTitle: React.CSSProperties = {
  ...SECTION_TITLE_STYLE,
  marginBottom: "14px",
  paddingBottom: "10px",
  borderBottom: "0.5px solid var(--color-border-tertiary)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "0.5px solid var(--color-border-tertiary)",
  borderRadius: "var(--radius-md)",
  fontSize: "13px",
  background: "var(--color-background-primary)",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--foreground)", marginBottom: "5px" }}>
        {label}
        {hint && <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--muted-foreground)", marginLeft: "6px" }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

// ── メインコンポーネント ──────────────────────────────

export default function SettingsForm() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setMounted(true);
  }, []);

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    if (!confirm("設定を初期値に戻しますか？")) return;
    localStorage.removeItem(SETTINGS_KEY);
    setSettings(DEFAULT_SETTINGS);
  }

  if (!mounted) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "640px" }}>

      {/* 事業所・担当者情報 */}
      <div style={card}>
        <p style={sectionTitle}>事業所・担当者情報</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Field label="事業所名" hint="文書の宛先・署名に使用されます">
            <input
              type="text"
              value={settings.officeName}
              onChange={(e) => update("officeName", e.target.value)}
              placeholder="例：株式会社〇〇 / 〇〇工場"
              style={inputStyle}
            />
          </Field>
          <Field label="担当産業保健師名" hint="文書の署名・差出人に使用されます">
            <input
              type="text"
              value={settings.nurseName}
              onChange={(e) => update("nurseName", e.target.value)}
              placeholder="例：山田 花子"
              style={inputStyle}
            />
          </Field>
          <Field label="連絡先電話番号">
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="例：03-1234-5678"
              style={inputStyle}
            />
          </Field>
          <Field label="文書の署名・フッター" hint="AI生成文書の末尾に追加されます">
            <textarea
              value={settings.docSignature}
              onChange={(e) => update("docSignature", e.target.value)}
              rows={3}
              placeholder={`例：\n産業保健師　山田 花子\nTEL：03-1234-5678\n受付時間：月〜金 9:00〜17:00`}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
            />
          </Field>
        </div>
      </div>

      {/* フォロー管理設定 */}
      <div style={card}>
        <p style={sectionTitle}>フォロー管理設定</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Field label="要フォロー判定日数" hint="最終面談からこの日数を超えると「未対応」と判定">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="number"
                min={7}
                max={365}
                value={settings.followUpDays}
                onChange={(e) => update("followUpDays", Number(e.target.value))}
                style={{ ...inputStyle, width: "100px" }}
              />
              <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>日</span>
              <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>（デフォルト：90日）</span>
            </div>
          </Field>

          <Field label="アラート対象判定" hint="レポートの要フォロー者一覧に表示する判定">
            <div style={{ display: "flex", gap: "6px" }}>
              {["A", "B", "C", "D"].map((j) => {
                const active = settings.alertJudgments.includes(j);
                const colors: Record<string, { bg: string; text: string }> = {
                  A: { bg: "#EAF3DE", text: "#639922" },
                  B: { bg: "#FAECE7", text: "#D85A30" },
                  C: { bg: "#FAEEDA", text: "#EF9F27" },
                  D: { bg: "#FCEBEB", text: "#E24B4A" },
                };
                const c = colors[j];
                return (
                  <button
                    key={j}
                    type="button"
                    onClick={() => {
                      const next = active
                        ? settings.alertJudgments.filter((x) => x !== j)
                        : [...settings.alertJudgments, j];
                      update("alertJudgments", next);
                    }}
                    style={{
                      padding: "5px 14px",
                      borderRadius: "20px",
                      border: `0.5px solid ${active ? c.text : "var(--color-border-tertiary)"}`,
                      background: active ? c.bg : "transparent",
                      color: active ? c.text : "var(--muted-foreground)",
                      fontSize: "13px",
                      fontWeight: active ? 700 : 400,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                  >
                    {j}判定
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
      </div>

      {/* システム情報 */}
      <div style={card}>
        <p style={sectionTitle}>システム情報</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { label: "アプリ名", value: "さんぽかるて" },
            { label: "バージョン", value: "MVP" },
            { label: "設定の保存先", value: "ブラウザ（localStorage）" },
            { label: "ログイン機能", value: "未実装（今後対応予定）" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", gap: "12px", fontSize: "13px", padding: "4px 0" }}>
              <span style={{ color: "var(--muted-foreground)", minWidth: "140px", flexShrink: 0 }}>{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ボタン */}
      <div style={{ display: "flex", gap: "8px", justifyContent: "space-between", alignItems: "center" }}>
        <button
          type="button"
          onClick={handleReset}
          style={{
            padding: "7px 16px", borderRadius: "20px",
            border: "0.5px solid var(--color-border-tertiary)",
            background: "transparent", color: "var(--muted-foreground)",
            fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          初期値に戻す
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {saved && (
            <span style={{ fontSize: "12px", color: "var(--color-success)" }}>
              保存しました ✓
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: "8px 24px", borderRadius: "20px",
              border: "none", background: "var(--color-text-info)",
              color: "#fff", fontSize: "13px", fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.15s",
            }}
          >
            保存する
          </button>
        </div>
      </div>
    </div>
  );
}
