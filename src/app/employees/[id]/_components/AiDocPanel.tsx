"use client";

import { useState } from "react";

type DocType = "interview-invite" | "referral" | "interview-draft";

const DOC_TYPES: { id: DocType; label: string }[] = [
  { id: "interview-invite", label: "面談案内文を作る" },
  { id: "referral", label: "受診勧奨文を作る" },
  { id: "interview-draft", label: "面談記録の下書き" },
];

export default function AiDocPanel({
  employeeName,
  latestJudgment,
}: {
  employeeName: string;
  latestJudgment: string | null;
}) {
  const [selected, setSelected] = useState<DocType | null>(null);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate(type: DocType) {
    setSelected(type);
    setOutput("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type,
          context: {
            name: employeeName,
            judgment: latestJudgment,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "生成に失敗しました");
      setOutput(data.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {DOC_TYPES.map((dt) => {
          const isActive = selected === dt.id;
          return (
            <button
              key={dt.id}
              onClick={() => handleGenerate(dt.id)}
              disabled={loading}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: `1px solid ${isActive ? "var(--color-text-info)" : "var(--color-border-tertiary)"}`,
                background: isActive
                  ? "var(--color-background-info)"
                  : "transparent",
                color: isActive
                  ? "var(--color-text-info)"
                  : "var(--foreground)",
                fontSize: "13px",
                fontWeight: isActive ? 500 : 400,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.15s",
                opacity: loading && !isActive ? 0.5 : 1,
              }}
            >
              {dt.label}
            </button>
          );
        })}
      </div>

      {(loading || output || error) && (
        <div
          style={{
            background: "var(--color-background-secondary)",
            borderRadius: "var(--radius-md)",
            padding: "14px",
            minHeight: "80px",
          }}
        >
          {loading && (
            <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
              生成中...
            </p>
          )}
          {error && (
            <p style={{ fontSize: "13px", color: "var(--color-danger)" }}>
              {error}
            </p>
          )}
          {output && (
            <p
              style={{
                fontSize: "13px",
                lineHeight: 1.8,
                whiteSpace: "pre-wrap",
                color: "var(--foreground)",
              }}
            >
              {output}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
