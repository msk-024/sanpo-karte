"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, type EmployeeFormValues } from "@/lib/schemas/employee";
import { createEmployee } from "../_actions/createEmployee";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "0.5px solid var(--color-border-tertiary)",
  borderRadius: "var(--radius-md)",
  fontSize: "13px",
  background: "var(--color-background-primary)",
  outline: "none",
  boxSizing: "border-box",
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
          fontSize: "12px",
          fontWeight: 500,
          color: "var(--muted-foreground)",
          marginBottom: "5px",
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

export default function NewEmployeeForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      name_kana: "",
      department: "",
      birth_date: "",
      gender: "",
    },
  });

  async function onSubmit(values: EmployeeFormValues) {
    const formData = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (v != null) formData.set(k, String(v));
    });

    const result = await createEmployee(null, formData);
    if (result?.error) {
      setError("root", { message: result.error });
    }
    // 成功時は Server Action 内で redirect() されるため、ここには到達しない
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: "flex", flexDirection: "column", gap: "16px" }}
    >
      {/* ルートエラー（DB エラーなど） */}
      {errors.root && (
        <div
          style={{
            padding: "10px 14px",
            background: "var(--color-danger-bg)",
            border: "0.5px solid var(--color-danger)",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            color: "var(--color-danger)",
          }}
        >
          {errors.root.message}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <Field label="氏名" required error={errors.name?.message}>
          <input
            {...register("name")}
            placeholder="例：田中 花子"
            style={errors.name ? errorInputStyle : inputStyle}
          />
        </Field>

        <Field label="フリガナ" error={errors.name_kana?.message}>
          <input
            {...register("name_kana")}
            placeholder="例：タナカ ハナコ"
            style={errors.name_kana ? errorInputStyle : inputStyle}
          />
        </Field>

        <Field label="部署" error={errors.department?.message}>
          <input
            {...register("department")}
            placeholder="例：営業部"
            style={errors.department ? errorInputStyle : inputStyle}
          />
        </Field>

        <Field label="生年月日" error={errors.birth_date?.message}>
          <input
            type="date"
            {...register("birth_date")}
            min="1920-01-01"
            max={new Date().toISOString().split("T")[0]}
            style={errors.birth_date ? errorInputStyle : inputStyle}
          />
        </Field>

        <Field label="性別" error={errors.gender?.message}>
          <select
            {...register("gender")}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="">選択しない</option>
            <option value="male">男性</option>
            <option value="female">女性</option>
            <option value="other">その他</option>
          </select>
        </Field>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          paddingTop: "4px",
        }}
      >
        <button
          type="button"
          onClick={() => router.push("/employees")}
          style={{
            padding: "8px 20px",
            borderRadius: "20px",
            border: "0.5px solid var(--color-border-tertiary)",
            fontSize: "13px",
            color: "var(--muted-foreground)",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "8px 24px",
            borderRadius: "20px",
            border: "none",
            background: isSubmitting ? "var(--muted-foreground)" : "var(--color-text-info)",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 500,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
        >
          {isSubmitting ? "登録中..." : "登録する"}
        </button>
      </div>
    </form>
  );
}
