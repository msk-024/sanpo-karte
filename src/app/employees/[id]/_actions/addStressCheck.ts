"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase";

export type AddStressCheckState = { error: string } | { success: true } | null;

const VALID_CATEGORIES = ["通常", "要注意", "高ストレス"] as const;

export async function addStressCheck(
  employeeId: string,
  _prev: AddStressCheckState,
  formData: FormData
): Promise<AddStressCheckState> {
  const checkYear = Number(formData.get("check_year"));
  const resultCategory = formData.get("result_category") as string;
  const needsInterview = formData.get("needs_interview") === "true";
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!checkYear || checkYear < 2000 || checkYear > new Date().getFullYear()) {
    return { error: "年度が不正です" };
  }
  if (!VALID_CATEGORIES.includes(resultCategory as (typeof VALID_CATEGORIES)[number])) {
    return { error: "結果区分を選択してください" };
  }

  const supabase = createClient();
  const { error } = await supabase.from("stress_checks").insert({
    employee_id: employeeId,
    check_year: checkYear,
    result_category: resultCategory,
    needs_interview: needsInterview,
    notes,
  });

  if (error) {
    console.error("[addStressCheck]", error.message);
    return { error: "登録に失敗しました。時間をおいて再度お試しください。" };
  }

  revalidatePath(`/employees/${employeeId}`);
  return { success: true };
}
