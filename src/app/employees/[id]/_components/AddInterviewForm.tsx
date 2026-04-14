"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { interviewSchema, type InterviewFormValues } from "@/lib/schemas/interview";
import { addInterview } from "../_actions/addInterview";

const TODAY = new Date().toISOString().split("T")[0];

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
  error,
  children,
}: {
  label: string;
  required?: boolean;
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

export default function AddInterviewForm({ employeeId }: { employeeId: string }) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      interviewed_at: TODAY,
      interview_type: "routine",
      content: "",
      plan: "",
    },
  });

  async function onSubmit(values: InterviewFormValues) {
    const formData = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (v != null) formData.set(k, String(v));
    });

    const result = await addInterview(employeeId, null, formData);
    if (result && "error" in result) {
      setError("root", { message: result.error });
      return;
    }
    reset();
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
        ＋ 面談記録を追加
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
        面談記録を入力
      </p>

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
          <Field label="面談日" required error={errors.interviewed_at?.message}>
            <input
              type="date"
              {...register("interviewed_at")}
              max={TODAY}
              style={errors.interviewed_at ? errorInputStyle : inputStyle}
            />
          </Field>

          <Field label="面談種別" required error={errors.interview_type?.message}>
            <select
              {...register("interview_type")}
              style={{ ...(errors.interview_type ? errorInputStyle : inputStyle), cursor: "pointer" }}
            >
              <option value="routine">定期面談</option>
              <option value="mental">メンタル相談</option>
              <option value="referral">受診勧奨後フォロー</option>
              <option value="other">その他</option>
            </select>
          </Field>
        </div>

        <Field label="面談内容" required error={errors.content?.message}>
          <textarea
            {...register("content")}
            rows={4}
            placeholder="面談の内容を記録してください"
            style={{
              ...(errors.content ? errorInputStyle : inputStyle),
              resize: "vertical",
              lineHeight: 1.7,
            }}
          />
        </Field>

        <Field label="今後の方針・対応" error={errors.plan?.message}>
          <textarea
            {...register("plan")}
            rows={2}
            placeholder="次のアクション・フォローアップ予定など"
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
          />
        </Field>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button
            type="button"
            onClick={() => { reset(); setOpen(false); }}
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
            {isSubmitting ? "登録中..." : "記録する"}
          </button>
        </div>
      </form>
    </div>
  );
}
