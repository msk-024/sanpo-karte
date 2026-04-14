"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { healthCheckSchema, type HealthCheckFormValues } from "@/lib/schemas/healthCheck";
import { addHealthCheck } from "../_actions/addHealthCheck";

const CURRENT_YEAR = new Date().getFullYear();

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

const errorInputStyle: React.CSSProperties = {
  ...inputStyle,
  border: "0.5px solid var(--color-danger)",
};

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "11px",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.3px",
          color: "var(--muted-foreground)",
          marginBottom: "4px",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--color-danger)", marginLeft: "3px" }}>*</span>
        )}
        {hint && (
          <span style={{ fontSize: "10px", marginLeft: "4px", textTransform: "none", letterSpacing: 0 }}>
            ({hint})
          </span>
        )}
      </label>
      {children}
      {error && (
        <p style={{ fontSize: "11px", color: "var(--color-danger)", marginTop: "3px" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function toNullableNumber(v: number | null | undefined): number | null {
  if (v == null || isNaN(v as number)) return null;
  return v as number;
}

export default function AddHealthCheckForm({ employeeId }: { employeeId: string }) {
  const [open, setOpen] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractNote, setExtractNote] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<HealthCheckFormValues>({
    resolver: zodResolver(healthCheckSchema),
    defaultValues: {
      check_year: CURRENT_YEAR,
      judgment: undefined,
      bmi: null,
      blood_pressure_sys: null,
      blood_pressure_dia: null,
      blood_sugar: null,
      total_cholesterol: null,
      notes: "",
    },
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setExtractNote(null);
    // 同じファイルを再選択できるようリセット
    e.target.value = "";

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract-health-check", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setExtractNote({ type: "error", text: data.error ?? "読み取りに失敗しました" });
        return;
      }

      const ext = data.extracted;
      if (ext.check_year) setValue("check_year", Number(ext.check_year));
      if (ext.judgment) setValue("judgment", ext.judgment);
      if (ext.bmi != null) setValue("bmi", ext.bmi);
      if (ext.blood_pressure_sys != null) setValue("blood_pressure_sys", ext.blood_pressure_sys);
      if (ext.blood_pressure_dia != null) setValue("blood_pressure_dia", ext.blood_pressure_dia);
      if (ext.blood_sugar != null) setValue("blood_sugar", ext.blood_sugar);
      if (ext.total_cholesterol != null) setValue("total_cholesterol", ext.total_cholesterol);
      if (ext.notes) setValue("notes", ext.notes);

      setExtractNote({ type: "success", text: `「${file.name}」を読み取りました。内容を確認してから登録してください。` });
    } catch {
      setExtractNote({ type: "error", text: "通信エラーが発生しました" });
    } finally {
      setIsExtracting(false);
    }
  }

  async function onSubmit(values: HealthCheckFormValues) {
    const formData = new FormData();
    formData.set("check_year", String(values.check_year));
    formData.set("judgment", values.judgment);
    const num = (k: keyof HealthCheckFormValues) => {
      const v = toNullableNumber(values[k] as number | null);
      if (v != null) formData.set(k, String(v));
    };
    num("bmi");
    num("blood_pressure_sys");
    num("blood_pressure_dia");
    num("blood_sugar");
    num("total_cholesterol");
    if (values.notes) formData.set("notes", values.notes);

    const result = await addHealthCheck(employeeId, null, formData);
    if (result && "error" in result) {
      setError("root", { message: result.error });
      return;
    }
    reset();
    setExtractNote(null);
    setOpen(false);
  }

  if (!open) {
    return (
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
        ＋ 健診データを追加
      </button>
    );
  }

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
        健診データを入力
      </p>

      {/* スキャン読み取りボタン */}
      <div
        style={{
          marginBottom: "14px",
          padding: "12px",
          border: "0.5px dashed var(--color-border-tertiary)",
          borderRadius: "var(--radius-md)",
          background: "var(--color-background-primary)",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isExtracting}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: "0.5px solid var(--color-border-tertiary)",
              background: isExtracting ? "var(--color-background-secondary)" : "var(--color-background-primary)",
              fontSize: "12px",
              color: isExtracting ? "var(--muted-foreground)" : "var(--foreground)",
              cursor: isExtracting ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {isExtracting ? "読み取り中..." : "文書から読み取る"}
          </button>
          <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
            JPEG・PNG・PDF に対応
          </span>
        </div>
        {extractNote && (
          <p
            style={{
              marginTop: "8px",
              fontSize: "11px",
              color: extractNote.type === "success" ? "var(--color-success)" : "var(--color-danger)",
            }}
          >
            {extractNote.text}
          </p>
        )}
      </div>

      {errors.root && (
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
          {errors.root.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <Field label="実施年度" required error={errors.check_year?.message}>
            <input
              type="number"
              {...register("check_year", { valueAsNumber: true })}
              min={2000}
              max={CURRENT_YEAR}
              style={errors.check_year ? errorInputStyle : inputStyle}
            />
          </Field>

          <Field label="総合判定" required error={errors.judgment?.message}>
            <select
              {...register("judgment")}
              defaultValue=""
              style={{ ...(errors.judgment ? errorInputStyle : inputStyle), cursor: "pointer" }}
            >
              <option value="" disabled>選択</option>
              <option value="A">A判定</option>
              <option value="B">B判定</option>
              <option value="C">C判定（要経過観察）</option>
              <option value="D">D判定（要治療）</option>
            </select>
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
          <Field label="BMI" error={errors.bmi?.message}>
            <input
              type="number"
              step="0.1"
              {...register("bmi", { valueAsNumber: true })}
              placeholder="例：22.5"
              style={errors.bmi ? errorInputStyle : inputStyle}
            />
          </Field>

          <Field label="血圧（収縮期）" hint="mmHg" error={errors.blood_pressure_sys?.message}>
            <input
              type="number"
              {...register("blood_pressure_sys", { valueAsNumber: true })}
              placeholder="例：130"
              style={errors.blood_pressure_sys ? errorInputStyle : inputStyle}
            />
          </Field>

          <Field label="血圧（拡張期）" hint="mmHg" error={errors.blood_pressure_dia?.message}>
            <input
              type="number"
              {...register("blood_pressure_dia", { valueAsNumber: true })}
              placeholder="例：85"
              style={errors.blood_pressure_dia ? errorInputStyle : inputStyle}
            />
          </Field>

          <Field label="血糖値" hint="mg/dL" error={errors.blood_sugar?.message}>
            <input
              type="number"
              step="0.1"
              {...register("blood_sugar", { valueAsNumber: true })}
              placeholder="例：98.0"
              style={errors.blood_sugar ? errorInputStyle : inputStyle}
            />
          </Field>

          <Field label="総コレステロール" hint="mg/dL" error={errors.total_cholesterol?.message}>
            <input
              type="number"
              step="0.1"
              {...register("total_cholesterol", { valueAsNumber: true })}
              placeholder="例：185.0"
              style={errors.total_cholesterol ? errorInputStyle : inputStyle}
            />
          </Field>
        </div>

        <Field label="備考・所見" error={errors.notes?.message}>
          <textarea
            {...register("notes")}
            rows={2}
            placeholder="特記事項があれば入力"
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
          />
        </Field>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button
            type="button"
            onClick={() => { reset(); setExtractNote(null); setOpen(false); }}
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
            disabled={isSubmitting}
            style={{
              padding: "6px 20px",
              borderRadius: "20px",
              border: "none",
              background: isSubmitting ? "var(--muted-foreground)" : "var(--color-text-info)",
              color: "#fff",
              fontSize: "12px",
              fontWeight: 500,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            {isSubmitting ? "登録中..." : "登録する"}
          </button>
        </div>
      </form>
    </div>
  );
}
