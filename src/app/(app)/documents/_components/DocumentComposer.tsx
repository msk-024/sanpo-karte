"use client";

import { useEffect, useState } from "react";
import type { DocType } from "@/app/api/generate/route";
import { loadSettings, type AppSettings } from "@/app/(app)/settings/_components/SettingsForm";
import { saveToHistory, loadHistory, type DocHistoryItem } from "@/lib/docHistory";

export type EmployeeOption = {
  id: string;
  name: string;
  name_kana: string | null;
  department: string | null;
  gender: string | null;
  birth_date: string | null;
  latest_judgment: string | null;
  last_interview_date: string | null;
};

// ── 定数 ────────────────────────────────────────────────

const TOPICS = [
  "定期健診",
  "生活習慣病予防検診",
  "女性検診・がん検診",
  "面談案内",
  "ストレスチェック",
  "受診勧奨",
  "長時間労働対応",
  "事業者報告",
  "その他",
] as const;

type FormatDef = { id: DocType; icon: string; label: string; desc: string };

const FORMATS: FormatDef[] = [
  { id: "mail-notice",    icon: "📧", label: "メール・お知らせ文",  desc: "個人宛て or 一斉。短文・やわらかな文体" },
  { id: "formal-notice",  icon: "📄", label: "A4案内文",            desc: "日付・件名・本文の正式案内文書" },
  { id: "form-with-reply",icon: "✂️", label: "案内文＋回答票",      desc: "切り取り返信票付きのA4文書" },
  { id: "business-formal",icon: "🏢", label: "ビジネス文書",        desc: "記〜以上形式の正式文書" },
];

type TargetMode = "none" | "single" | "multi";

// ── スタイル ────────────────────────────────────────────

const panel: React.CSSProperties = {
  border: "0.5px solid var(--color-border-tertiary)",
  borderRadius: "var(--border-radius-lg)",
  padding: "16px",
  background: "var(--color-background-primary)",
};

const label: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.3px",
  color: "var(--muted-foreground)",
  marginBottom: "10px",
};

const textarea: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "0.5px solid var(--color-border-tertiary)",
  borderRadius: "var(--radius-md)",
  fontSize: "13px",
  background: "var(--color-background-primary)",
  outline: "none",
  resize: "vertical",
  lineHeight: 1.6,
  fontFamily: "inherit",
  boxSizing: "border-box",
};

// ── メインコンポーネント ─────────────────────────────────

type OutputItem = { empName: string; text: string };

export default function DocumentComposer({ employees }: { employees: EmployeeOption[] }) {
  const [topic,       setTopic]       = useState<string>("定期健診");
  const [customTopic, setCustomTopic] = useState("");
  const [format,      setFormat]      = useState<DocType>("mail-notice");
  const [content,     setContent]     = useState("");
  const [notes,       setNotes]       = useState("");
  const [targetMode,  setTargetMode]  = useState<TargetMode>("none");
  const [singleId,    setSingleId]    = useState("");
  const [checkedIds,  setCheckedIds]  = useState<Set<string>>(new Set());

  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [outputs,     setOutputs]     = useState<OutputItem[]>([]);
  const [copiedIdx,   setCopiedIdx]   = useState<number | "all" | null>(null);
  const [history,     setHistory]     = useState<DocHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setAppSettings(loadSettings());
    setHistory(loadHistory());
  }, []);

  const effectiveTopic = topic === "その他" ? (customTopic.trim() || "産業保健") : topic;

  // メール形式以外は対象者選択不要
  const showTarget = format === "mail-notice";

  // 生成対象リスト
  const targets: (EmployeeOption | null)[] = (() => {
    if (!showTarget || targetMode === "none") return [null];
    if (targetMode === "single") {
      const emp = employees.find((e) => e.id === singleId);
      return emp ? [emp] : [null];
    }
    return employees.filter((e) => checkedIds.has(e.id));
  })();

  const canGenerate = !loading && content.trim().length > 0;

  function toggleChecked(id: string) {
    const next = new Set(checkedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setCheckedIds(next);
  }

  async function generateOne(emp: EmployeeOption | null): Promise<string> {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: format,
        context: {
          topic: effectiveTopic,
          content: content.trim() || null,
          notes: notes.trim() || null,
          name: emp?.name ?? null,
          department: emp?.department ?? null,
          nurseName: appSettings?.nurseName || null,
          officeName: appSettings?.officeName || null,
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "生成に失敗しました");
    return data.text as string;
  }

  const formatLabel = FORMATS.find((f) => f.id === format)?.label ?? format;

  async function handleGenerate() {
    setOutputs([]);
    setError("");
    setCopiedIdx(null);
    setLoading(true);
    try {
      const results: OutputItem[] = [];
      for (const emp of targets) {
        const text = await generateOne(emp);
        results.push({ empName: emp?.name ?? "", text });
        setOutputs([...results]);
        // 履歴に保存
        saveToHistory({
          topic: effectiveTopic,
          formatLabel,
          targetName: emp?.name ?? "",
          text,
        });
      }
      setHistory(loadHistory());
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(text: string, idx: number | "all") {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  const allText = outputs
    .map((o) => (o.empName ? `【${o.empName}】\n${o.text}` : o.text))
    .join("\n\n---\n\n");

  const currentFormat = FORMATS.find((f) => f.id === format)!;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "start" }}>

      {/* ── 左パネル ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

        {/* トピック */}
        <div style={panel}>
          <p style={label}>何に関する文書ですか？</p>
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {TOPICS.map((t) => {
              const isActive = topic === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTopic(t); setOutputs([]); }}
                  style={{
                    padding: "5px 11px",
                    borderRadius: "20px",
                    border: `0.5px solid ${isActive ? "var(--color-text-info)" : "var(--color-border-tertiary)"}`,
                    background: isActive ? "var(--color-background-info)" : "transparent",
                    color: isActive ? "var(--color-text-info)" : "var(--muted-foreground)",
                    fontSize: "12px",
                    fontWeight: isActive ? 600 : 400,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
          {topic === "その他" && (
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="例：復職支援、就業配慮、過重労働面談..."
              style={{
                marginTop: "8px", width: "100%", padding: "7px 10px",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "var(--radius-md)", fontSize: "13px",
                background: "var(--color-background-primary)",
                outline: "none", fontFamily: "inherit", boxSizing: "border-box",
              }}
            />
          )}
        </div>

        {/* 形式選択 */}
        <div style={panel}>
          <p style={label}>文書の形式</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {FORMATS.map((f) => {
              const isActive = format === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => { setFormat(f.id); setOutputs([]); setError(""); if (f.id !== "mail-notice") setTargetMode("none"); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "9px 12px", borderRadius: "var(--radius-md)",
                    border: `0.5px solid ${isActive ? "var(--color-text-info)" : "var(--color-border-tertiary)"}`,
                    background: isActive ? "var(--color-background-info)" : "transparent",
                    cursor: "pointer", textAlign: "left", width: "100%",
                    fontFamily: "inherit", transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: "18px", lineHeight: 1, flexShrink: 0 }}>{f.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "13px", fontWeight: isActive ? 600 : 400, color: isActive ? "var(--color-text-info)" : "var(--foreground)" }}>
                      {f.label}
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: "1px" }}>{f.desc}</p>
                  </div>
                  {isActive && <span style={{ fontSize: "11px", color: "var(--color-text-info)", fontWeight: 700 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* 内容・要点 */}
        <div style={panel}>
          <p style={label}>
            内容・要点
            <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: "6px" }}>（必須）</span>
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder={
              format === "mail-notice"
                ? "例：ストレスチェックの結果から面談対象となりました。日程を調整したいので、開いている時間帯を連絡してください。"
                : format === "form-with-reply"
                ? "例：生活習慣病予防検診の希望有無を回答してください。偶数年の方は補助あり。"
                : "何を伝えたいか、AIへのヒントになる内容・要点を書いてください。"
            }
            style={textarea}
          />
        </div>

        {/* 備考 */}
        <div style={panel}>
          <p style={label}>
            備考
            <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: "6px" }}>（提出先・期限・持ち物・オプション等）</span>
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="例：期限5月8日、提出先は健康管理室または人事総務部。38歳以下は子宮頸がん検診オプションあり。"
            style={textarea}
          />
        </div>

        {/* 対象者（メール形式のみ） */}
        {showTarget && (
          <div style={panel}>
            <p style={label}>
              対象者の指定
              <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: "6px" }}>（省略で「従業員各位」宛て）</span>
            </p>
            <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
              {([["none", "指定なし"], ["single", "個別"], ["multi", "複数選択"]] as [TargetMode, string][]).map(([val, lbl]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTargetMode(val)}
                  style={{
                    flex: 1, padding: "7px", borderRadius: "var(--radius-md)",
                    border: `0.5px solid ${targetMode === val ? "var(--color-text-info)" : "var(--color-border-tertiary)"}`,
                    background: targetMode === val ? "var(--color-background-info)" : "transparent",
                    color: targetMode === val ? "var(--color-text-info)" : "var(--muted-foreground)",
                    fontSize: "12px", fontWeight: targetMode === val ? 600 : 400,
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>

            {targetMode === "single" && (
              <select
                value={singleId}
                onChange={(e) => setSingleId(e.target.value)}
                style={{
                  width: "100%", padding: "8px 10px",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--radius-md)", fontSize: "13px",
                  background: "var(--color-background-primary)",
                  color: singleId ? "var(--foreground)" : "var(--muted-foreground)",
                  cursor: "pointer", outline: "none", fontFamily: "inherit",
                }}
              >
                <option value="">従業員を選択</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}{e.name_kana ? `（${e.name_kana}）` : ""}
                    {e.department ? ` ／ ${e.department}` : ""}
                  </option>
                ))}
              </select>
            )}

            {targetMode === "multi" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <button type="button" onClick={() => setCheckedIds(new Set(employees.map((e) => e.id)))}
                    style={{ fontSize: "11px", color: "var(--color-text-info)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                    全選択
                  </button>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>／</span>
                  <button type="button" onClick={() => setCheckedIds(new Set())}
                    style={{ fontSize: "11px", color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                    全解除
                  </button>
                  {checkedIds.size > 0 && (
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-info)", marginLeft: "auto" }}>
                      {checkedIds.size}名選択中
                    </span>
                  )}
                </div>
                <div style={{
                  maxHeight: "180px", overflowY: "auto",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-background-secondary)",
                }}>
                  {employees.map((emp, i) => (
                    <label
                      key={emp.id}
                      style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "7px 10px", cursor: "pointer",
                        borderBottom: i < employees.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none",
                        background: checkedIds.has(emp.id) ? "var(--color-background-info)" : "transparent",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checkedIds.has(emp.id)}
                        onChange={() => toggleChecked(emp.id)}
                        style={{ flexShrink: 0, accentColor: "var(--color-text-info)" }}
                      />
                      <span style={{ fontSize: "13px", fontWeight: 500 }}>{emp.name}</span>
                      {emp.department && <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{emp.department}</span>}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 生成ボタン */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          style={{
            padding: "11px", borderRadius: "var(--radius-md)", border: "none",
            background: canGenerate ? "var(--color-text-info)" : "var(--color-border-tertiary)",
            color: canGenerate ? "#fff" : "var(--muted-foreground)",
            fontSize: "14px", fontWeight: 600,
            cursor: canGenerate ? "pointer" : "not-allowed",
            fontFamily: "inherit", transition: "all 0.15s",
          }}
        >
          {loading
            ? `生成中... (${outputs.length}/${targets.length})`
            : targets.length > 1
            ? `${targets.length}名分の文書を生成する`
            : "文書を生成する"}
        </button>

        {!content.trim() && (
          <p style={{ fontSize: "12px", color: "var(--muted-foreground)", textAlign: "center", marginTop: "-6px" }}>
            ↑ 「内容・要点」を入力してください
          </p>
        )}
      </div>

      {/* ── 右パネル ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.3px", color: "var(--muted-foreground)" }}>
            生成結果 {outputs.length > 0 && `（${outputs.length}件）`}
          </p>
          <div style={{ display: "flex", gap: "6px" }}>
            {outputs.length > 1 && (
              <button
                type="button"
                onClick={() => handleCopy(allText, "all")}
                style={{
                  padding: "4px 12px", borderRadius: "20px",
                  border: "0.5px solid var(--color-border-tertiary)",
                  background: copiedIdx === "all" ? "var(--color-background-info)" : "transparent",
                  color: copiedIdx === "all" ? "var(--color-text-info)" : "var(--muted-foreground)",
                  fontSize: "11px", cursor: "pointer", fontFamily: "inherit",
                }}
              >
                {copiedIdx === "all" ? "コピーしました ✓" : "全員分まとめてコピー"}
              </button>
            )}
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistory((v) => !v)}
                style={{
                  padding: "4px 12px", borderRadius: "20px",
                  border: "0.5px solid var(--color-border-tertiary)",
                  background: showHistory ? "var(--color-background-secondary)" : "transparent",
                  color: "var(--muted-foreground)",
                  fontSize: "11px", cursor: "pointer", fontFamily: "inherit",
                }}
              >
                履歴 ({history.length})
              </button>
            )}
          </div>
        </div>

        {/* 履歴パネル */}
        {showHistory && history.length > 0 && (
          <div style={{
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            background: "var(--color-background-primary)",
            overflow: "hidden",
          }}>
            <p style={{
              fontSize: "11px", fontWeight: 500, padding: "8px 12px",
              borderBottom: "0.5px solid var(--color-border-tertiary)",
              background: "var(--color-background-secondary)",
              color: "var(--muted-foreground)",
            }}>
              過去の生成履歴（クリックで表示）
            </p>
            <div style={{ maxHeight: "280px", overflowY: "auto" }}>
              {history.map((h, i) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => {
                    setOutputs([{ empName: h.targetName, text: h.text }]);
                    setShowHistory(false);
                  }}
                  style={{
                    display: "flex", flexDirection: "column", gap: "2px",
                    width: "100%", padding: "8px 12px", textAlign: "left",
                    background: "transparent", border: "none", cursor: "pointer",
                    borderBottom: i < history.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none",
                    fontFamily: "inherit", transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-background-secondary)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--foreground)" }}>
                      {h.topic}
                    </span>
                    <span style={{
                      fontSize: "10px", padding: "1px 6px", borderRadius: "20px",
                      background: "var(--color-background-secondary)",
                      border: "0.5px solid var(--color-border-tertiary)",
                      color: "var(--muted-foreground)",
                    }}>
                      {h.formatLabel}
                    </span>
                    {h.targetName && (
                      <span style={{ fontSize: "11px", color: "var(--color-text-info)" }}>{h.targetName}</span>
                    )}
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                    {new Date(h.createdAt).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    　{h.text.slice(0, 30).replace(/\n/g, " ")}…
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: "12px", background: "#FCEBEB", borderRadius: "var(--radius-md)", fontSize: "13px", color: "var(--color-danger)" }}>
            {error}
          </div>
        )}

        {/* 空状態 */}
        {outputs.length === 0 && !loading && !error && (
          <div style={{
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            background: "var(--color-background-primary)",
            minHeight: "300px", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "10px",
            color: "var(--muted-foreground)",
          }}>
            <span style={{ fontSize: "32px" }}>{currentFormat.icon}</span>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "13px", fontWeight: 500 }}>{effectiveTopic} ／ {currentFormat.label}</p>
              <p style={{ fontSize: "11px", marginTop: "4px" }}>内容・要点を入力して生成してください</p>
            </div>
          </div>
        )}

        {/* 生成中スケルトン */}
        {loading && outputs.length === 0 && (
          <div style={{
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            background: "var(--color-background-primary)",
            minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--muted-foreground)", fontSize: "13px",
          }}>
            生成中...
          </div>
        )}

        {/* 結果カード */}
        {outputs.map((out, idx) => (
          <div
            key={idx}
            style={{
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-lg)",
              background: "var(--color-background-primary)",
              overflow: "hidden",
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 14px",
              borderBottom: "0.5px solid var(--color-border-tertiary)",
              background: "var(--color-background-secondary)",
            }}>
              <span style={{ fontSize: "12px", fontWeight: 600 }}>
                {out.empName || "生成結果"}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(out.text, idx)}
                style={{
                  padding: "3px 10px", borderRadius: "20px",
                  border: "0.5px solid var(--color-border-tertiary)",
                  background: copiedIdx === idx ? "var(--color-background-info)" : "transparent",
                  color: copiedIdx === idx ? "var(--color-text-info)" : "var(--muted-foreground)",
                  fontSize: "11px", cursor: "pointer", fontFamily: "inherit",
                }}
              >
                {copiedIdx === idx ? "コピー ✓" : "コピー"}
              </button>
            </div>
            <p style={{
              padding: "12px 14px", fontSize: "13px", lineHeight: 1.9,
              whiteSpace: "pre-wrap", color: "var(--foreground)",
            }}>
              {out.text}
            </p>
          </div>
        ))}

        {loading && outputs.length > 0 && (
          <div style={{
            border: "0.5px dashed var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            padding: "20px", textAlign: "center",
            fontSize: "13px", color: "var(--muted-foreground)",
          }}>
            生成中...
          </div>
        )}
      </div>
    </div>
  );
}
