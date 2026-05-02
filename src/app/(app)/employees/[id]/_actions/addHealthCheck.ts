"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export type AddHealthCheckState =
  | { error: string }
  | { success: true }
  | null;

const VALID_JUDGMENTS = ["A", "B", "C", "D"] as const;

function parseOptionalFloat(value: string | null): number | null {
  if (!value) return null;
  const n = parseFloat(value);
  return isNaN(n) ? null : n;
}

function parseOptionalInt(value: string | null): number | null {
  if (!value) return null;
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

export async function addHealthCheck(
  employeeId: string,
  _prev: AddHealthCheckState,
  formData: FormData
): Promise<AddHealthCheckState> {
  const checkYearRaw = formData.get("check_year") as string;
  const judgment = formData.get("judgment") as string;

  // バリデーション
  const checkYear = parseInt(checkYearRaw, 10);
  const currentYear = new Date().getFullYear();
  if (isNaN(checkYear) || checkYear < 2000 || checkYear > currentYear) {
    return { error: `実施年度は2000〜${currentYear}の範囲で入力してください` };
  }

  if (!judgment || !VALID_JUDGMENTS.includes(judgment as (typeof VALID_JUDGMENTS)[number])) {
    return { error: "総合判定を選択してください" };
  }

  const bmi = parseOptionalFloat(formData.get("bmi") as string);
  const bloodPressureSys = parseOptionalInt(formData.get("blood_pressure_sys") as string);
  const bloodPressureDia = parseOptionalInt(formData.get("blood_pressure_dia") as string);
  const bloodSugar = parseOptionalFloat(formData.get("blood_sugar") as string);
  const totalCholesterol = parseOptionalFloat(formData.get("total_cholesterol") as string);
  const notes = (formData.get("notes") as string)?.trim() || null;

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("health_checks").insert({
    employee_id: employeeId,
    check_year: checkYear,
    judgment,
    bmi,
    blood_pressure_sys: bloodPressureSys,
    blood_pressure_dia: bloodPressureDia,
    blood_sugar: bloodSugar,
    total_cholesterol: totalCholesterol,
    notes,
  });

  if (error) {
    console.error("[addHealthCheck]", error.message);
    return { error: "登録に失敗しました。時間をおいて再度お試しください。" };
  }

  revalidatePath(`/employees/${employeeId}`);
  return { success: true };
}
