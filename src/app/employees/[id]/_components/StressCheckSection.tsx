"use client";

import { useState } from "react";
import { addStressCheck } from "../_actions/addStressCheck";

export type StressCheck = {
  id: string;
  check_year: number;
  result_category: string;
  needs_interview: boolean;
  notes: string | null;
  created_at: string;
};

const CATEGORY_STYLE: Record<string, { bg: string; color: string }> = {
  通常:     { bg: "#EAF3DE", color: "#639922" },
  要注意:   { bg: "#FAEEDA", color: "#EF9F27" },
  高ストレス: { bg: "#FCEBEB", color: "#E24B4A" },
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  border: "0.5px solid var(--color-border-tertiary)",
  borderRadius: "var(--radius-md)",
  fontSize: "13px",
  background: "var(--color-background-primary)",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const CURRENT_YEAR = new Date().getFullYear();

export default function StressCheckSection({
  employeeId,
  checks,
}: {
  employeeId: string;
  checks: StressCheck[];
}) {
  const [open, setOpen] = useState(false);
  const [checkYear, setCheckYear] = useState(String(CURRENT_YEAR));
  const [category, setCategory] = useState("通常");
  const [needsInterview, setNeedsInterview] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    fd.set("check_year", checkYear);
    fd.set("result_category", category);
    fd.set("needs_interview", String(needsInterview));
    fd.set("notes", notes);

    const result = await addStressCheck(employeeId, null, fd);
    setSubmitting(false);

    if (result && "error" in result) {
      setError(result.error);
      return;
    }
    setOpen(false);
    setCheckYear(String(CURRENT_YEAR));
    setCategory("通常");
    setNeedsInterview(false);
    setNotes("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {checks.length === 0 ? (
        <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
          登録されたストレスチェック結果はありません
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {checks.map((c) => {
            const s = CATEGORY_STYLE[c.result_category] ?? CATEGORY_STYLE["通常"];
            return (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-background-primary)",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: 600, minWidth: "60px" }}>
                  {c.check_year}年
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    background: s.bg,
                    color: s.color,
                    padding: "2px 10px",
                    borderRadius: "20px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.result_category}
                </span>
                {c.needs_interview && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      background: "#FCEBEB",
                      color: "#E24B4A",
                      padding: "2px 10px",
                      borderRadius: "20px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    面談要
                  </span>
                )}
                {c.notes && (
                  <span style={{ fontSize: "12px", color: "var(--muted-foreground)", flex: 1 }}>
                    {c.notes}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            fontSize: "13px",
            color: "var(--color-text-info)",
            background: "transparent",
            border: "0.5px dashed var(--color-text-info)",
            borderRadius: "var(--radius-md)",
            padding: "8px 16px",
            cursor: "pointer",
            width: "100%",
            transition: "background 0.15s",
          }}
        >
          ＋ ストレスチェック結果を追加
        </button>
      ) : (
        <div
          style={{
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--radius-md)",
            padding: "16px",
            background: "var(--color-background-secondary)",
          }}
        >
          <p style={{ fontSize: "13px", fontWeight: 500, marginBottom: "14px" }}>
            ストレスチェック結果を入力
          </p>

          {error && (
            <div
              style={{
                marginBottom: "12px",
                padding: "8px 12px",
                background: "var(--color-danger-bg)",
                border: "0.5px solid var(--color-danger)",
                borderRadius: "var(--radius-md)",
                fontSize: "12px",
                color: "var(--color-danger)",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.3px", color: "var(--muted-foreground)", marginBottom: "4px" }}>
                  実施年 <span style={{ color: "var(--color-danger)" }}>*</span>
                </label>
                <input
                  type="number"
                  value={checkYear}
                  onChange={(e) => setCheckYear(e.target.value)}
                  min={2000}
                  max={CURRENT_YEAR}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.3px", color: "var(--muted-foreground)", marginBottom: "4px" }}>
                  結果区分 <span style={{ color: "var(--color-danger)" }}>*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                  required
                >
                  <option value="通常">通常</option>
                  <option value="要注意">要注意</option>
                  <option value="高ストレス">高ストレス</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                id="needs_interview"
                checked={needsInterview}
                onChange={(e) => setNeedsInterview(e.target.checked)}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <label
                htmlFor="needs_interview"
                style={{ fontSize: "13px", cursor: "pointer" }}
              >
                面談要（高ストレス者面談対象）
              </label>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.3px", color: "var(--muted-foreground)", marginBottom: "4px" }}>
                メモ
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="面談実施日・対応状況など"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  padding: "6px 16px",
                  borderRadius: "20px",
                  border: "0.5px solid var(--color-border-tertiary)",
                  background: "transparent",
                  fontSize: "12px",
                  color: "var(--muted-foreground)",
                  cursor: "pointer",
                }}
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "6px 20px",
                  borderRadius: "20px",
                  border: "none",
                  background: submitting ? "var(--muted-foreground)" : "var(--color-text-info)",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: submitting ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                }}
              >
                {submitting ? "登録中..." : "記録する"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
