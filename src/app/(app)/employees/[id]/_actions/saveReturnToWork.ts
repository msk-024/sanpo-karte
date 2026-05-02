"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export type SaveReturnToWorkState = { error: string } | { success: true } | null;

const VALID_PHASES = ["休職中", "試し出勤", "復職済", "復職プラン策定中"] as const;

function dateOrNull(v: FormDataEntryValue | null): string | null {
  const s = (v as string)?.trim();
  return s || null;
}

function textOrNull(v: FormDataEntryValue | null): string | null {
  const s = (v as string)?.trim();
  return s || null;
}

export async function saveReturnToWork(
  employeeId: string,
  recordId: string | null,
  _prev: SaveReturnToWorkState,
  formData: FormData
): Promise<SaveReturnToWorkState> {
  const phase = formData.get("phase") as string;

  if (!VALID_PHASES.includes(phase as (typeof VALID_PHASES)[number])) {
    return { error: "フェーズを選択してください" };
  }

  const payload = {
    employee_id: employeeId,
    phase,
    leave_start_date: dateOrNull(formData.get("leave_start_date")),
    return_date: dateOrNull(formData.get("return_date")),
    diagnosis: textOrNull(formData.get("diagnosis")),
    work_restrictions: textOrNull(formData.get("work_restrictions")),
    physician_interview_date: dateOrNull(formData.get("physician_interview_date")),
    physician_notes: textOrNull(formData.get("physician_notes")),
    doctor_certificate_notes: textOrNull(formData.get("doctor_certificate_notes")),
    return_plan: textOrNull(formData.get("return_plan")),
    notes: textOrNull(formData.get("notes")),
    updated_at: new Date().toISOString(),
  };

  const supabase = await createServerSupabaseClient();

  if (recordId) {
    const { error } = await supabase
      .from("return_to_work")
      .update(payload)
      .eq("id", recordId);
    if (error) {
      console.error("[saveReturnToWork update]", error.message);
      return { error: "更新に失敗しました。時間をおいて再度お試しください。" };
    }
  } else {
    const { error } = await supabase.from("return_to_work").insert(payload);
    if (error) {
      console.error("[saveReturnToWork insert]", error.message);
      return { error: "登録に失敗しました。時間をおいて再度お試しください。" };
    }
  }

  revalidatePath(`/employees/${employeeId}`);
  return { success: true };
}
