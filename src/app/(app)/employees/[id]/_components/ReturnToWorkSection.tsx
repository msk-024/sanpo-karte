"use client";

import { useState } from "react";
import { saveReturnToWork } from "../_actions/saveReturnToWork";

export type ReturnToWorkRecord = {
  id: string;
  phase: string;
  leave_start_date: string | null;
  return_date: string | null;
  diagnosis: string | null;
  work_restrictions: string | null;
  physician_interview_date: string | null;
  physician_notes: string | null;
  doctor_certificate_notes: string | null;
  return_plan: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const PHASE_STYLE: Record<string, { bg: string; color: string }> = {
  "復職プラン策定中": { bg: "#EAF3DE", color: "#639922" },
  "休職中":           { bg: "#FCEBEB", color: "#E24B4A" },
  "試し出勤":         { bg: "#FAEEDA", color: "#EF9F27" },
  "復職済":           { bg: "#E8F4FB", color: "#2E7DB7" },
};

const PHASES = ["復職プラン策定中", "休職中", "試し出勤", "復職済"] as const;

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

const taStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  lineHeight: 1.7,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.3px",
  color: "var(--muted-foreground)",
  marginBottom: "4px",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function fmt(s: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: "8px", fontSize: "13px", flexWrap: "wrap" }}>
      <span style={{ color: "var(--muted-foreground)", minWidth: "140px", flexShrink: 0 }}>{label}</span>
      <span style={{ whiteSpace: "pre-wrap", flex: 1 }}>{value || "—"}</span>
    </div>
  );
}

function RecordCard({
  record,
  onEdit,
}: {
  record: ReturnToWorkRecord;
  onEdit: () => void;
}) {
  const ps = PHASE_STYLE[record.phase] ?? { bg: "#F3F4F6", color: "#6B7280" };
  return (
    <div
      style={{
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        background: "var(--color-background-primary)",
        overflow: "hidden",
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          background: "var(--color-background-secondary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 500,
              background: ps.bg,
              color: ps.color,
              padding: "3px 12px",
              borderRadius: "20px",
            }}
          >
            {record.phase}
          </span>
          {record.diagnosis && (
            <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
              {record.diagnosis}
            </span>
          )}
        </div>
        <button
          onClick={onEdit}
          style={{
            fontSize: "12px",
            color: "var(--color-text-info)",
            background: "transparent",
            border: "0.5px solid var(--color-text-info)",
            borderRadius: "20px",
            padding: "3px 12px",
            cursor: "pointer",
          }}
        >
          編集
        </button>
      </div>

      {/* 詳細 */}
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <InfoRow label="休職開始日" value={fmt(record.leave_start_date)} />
          <InfoRow label="復職日" value={fmt(record.return_date)} />
        </div>
        <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <InfoRow label="就業配慮事項" value={record.work_restrictions ?? ""} />
          <InfoRow label="復職プラン" value={record.return_plan ?? ""} />
          {record.physician_interview_date && (
            <InfoRow label="産業医面談日" value={fmt(record.physician_interview_date)} />
          )}
          {record.physician_notes && (
            <InfoRow label="産業医コメント" value={record.physician_notes} />
          )}
          {record.doctor_certificate_notes && (
            <InfoRow label="診断書記載内容" value={record.doctor_certificate_notes} />
          )}
          {record.notes && (
            <InfoRow label="その他メモ" value={record.notes} />
          )}
        </div>
      </div>
    </div>
  );
}

function RecordForm({
  employeeId,
  record,
  onClose,
}: {
  employeeId: string;
  record: ReturnToWorkRecord | null;
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const result = await saveReturnToWork(employeeId, record?.id ?? null, null, fd);
    setSubmitting(false);

    if (result && "error" in result) {
      setError(result.error);
      return;
    }
    onClose();
  }

  const d = record;

  return (
    <div
      style={{
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--radius-md)",
        padding: "16px",
        background: "var(--color-background-secondary)",
      }}
    >
      <p style={{ fontSize: "13px", fontWeight: 500, marginBottom: "14px" }}>
        {record ? "復職支援記録を編集" : "復職支援記録を新規作成"}
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

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* フェーズ + 診断名 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <Field label="フェーズ *">
            <select
              name="phase"
              defaultValue={d?.phase ?? "休職中"}
              style={{ ...inputStyle, cursor: "pointer" }}
              required
            >
              {PHASES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="診断名">
            <input
              type="text"
              name="diagnosis"
              defaultValue={d?.diagnosis ?? ""}
              placeholder="適応障害 / うつ病 など"
              style={inputStyle}
            />
          </Field>
        </div>

        {/* 日付 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          <Field label="休職開始日">
            <input
              type="date"
              name="leave_start_date"
              defaultValue={d?.leave_start_date ?? ""}
              style={inputStyle}
            />
          </Field>
          <Field label="復職日">
            <input
              type="date"
              name="return_date"
              defaultValue={d?.return_date ?? ""}
              style={inputStyle}
            />
          </Field>
          <Field label="産業医面談日">
            <input
              type="date"
              name="physician_interview_date"
              defaultValue={d?.physician_interview_date ?? ""}
              style={inputStyle}
            />
          </Field>
        </div>

        {/* 就業配慮事項 */}
        <Field label="就業配慮事項">
          <textarea
            name="work_restrictions"
            defaultValue={d?.work_restrictions ?? ""}
            rows={2}
            placeholder="時間外禁止・残業制限・部署異動 など"
            style={taStyle}
          />
        </Field>

        {/* 復職プラン */}
        <Field label="復職プラン">
          <textarea
            name="return_plan"
            defaultValue={d?.return_plan ?? ""}
            rows={3}
            placeholder="段階的な業務復帰スケジュール・目標など"
            style={taStyle}
          />
        </Field>

        {/* 産業医コメント */}
        <Field label="産業医コメント">
          <textarea
            name="physician_notes"
            defaultValue={d?.physician_notes ?? ""}
            rows={2}
            placeholder="産業医からの所見・指示事項"
            style={taStyle}
          />
        </Field>

        {/* 診断書記載内容 */}
        <Field label="診断書記載内容">
          <textarea
            name="doctor_certificate_notes"
            defaultValue={d?.doctor_certificate_notes ?? ""}
            rows={2}
            placeholder="主治医からの診断書に記載された内容"
            style={taStyle}
          />
        </Field>

        {/* メモ */}
        <Field label="その他メモ">
          <textarea
            name="notes"
            defaultValue={d?.notes ?? ""}
            rows={2}
            placeholder="家族との連絡状況・本人の状態など"
            style={taStyle}
          />
        </Field>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button
            type="button"
            onClick={onClose}
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
            {submitting ? "保存中..." : "保存する"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ReturnToWorkSection({
  employeeId,
  records,
}: {
  employeeId: string;
  records: ReturnToWorkRecord[];
}) {
  const [formState, setFormState] = useState<"closed" | "new" | string>("closed");

  const editingRecord =
    formState !== "closed" && formState !== "new"
      ? (records.find((r) => r.id === formState) ?? null)
      : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {records.length === 0 && formState === "closed" && (
        <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
          登録された復職支援記録はありません
        </p>
      )}

      {records.map((r) => (
        formState === r.id ? (
          <RecordForm
            key={r.id}
            employeeId={employeeId}
            record={r}
            onClose={() => setFormState("closed")}
          />
        ) : (
          <RecordCard
            key={r.id}
            record={r}
            onEdit={() => setFormState(r.id)}
          />
        )
      ))}

      {formState === "new" && (
        <RecordForm
          employeeId={employeeId}
          record={null}
          onClose={() => setFormState("closed")}
        />
      )}

      {formState === "closed" && (
        <button
          onClick={() => setFormState("new")}
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
          ＋ 復職支援記録を追加
        </button>
      )}
    </div>
  );
}
