"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase";

export type AddInterviewState = { error: string } | { success: true } | null;

const VALID_TYPES = ["routine", "mental", "referral", "other"] as const;

export async function addInterview(
  employeeId: string,
  _prev: AddInterviewState,
  formData: FormData
): Promise<AddInterviewState> {
  const interviewedAt = formData.get("interviewed_at") as string;
  const interviewType = formData.get("interview_type") as string;
  const content = (formData.get("content") as string)?.trim();
  const plan = (formData.get("plan") as string)?.trim() || null;

  if (!interviewedAt) {
    return { error: "面談日は必須です" };
  }
  if (!VALID_TYPES.includes(interviewType as (typeof VALID_TYPES)[number])) {
    return { error: "面談種別を選択してください" };
  }
  if (!content) {
    return { error: "面談内容は必須です" };
  }

  const supabase = createClient();
  const { error } = await supabase.from("interviews").insert({
    employee_id: employeeId,
    interviewed_at: interviewedAt,
    interview_type: interviewType,
    content,
    plan,
  });

  if (error) {
    console.error("[addInterview]", error.message);
    return { error: "登録に失敗しました。時間をおいて再度お試しください。" };
  }

  revalidatePath(`/employees/${employeeId}`);
  return { success: true };
}
