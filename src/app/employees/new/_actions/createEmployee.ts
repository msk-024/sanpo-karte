"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { employeeSchema } from "@/lib/schemas/employee";

export type CreateEmployeeState = { error: string } | null;

export async function createEmployee(
  _prev: CreateEmployeeState,
  formData: FormData
): Promise<CreateEmployeeState> {
  // Zodでサーバーサイドバリデーション
  const parsed = employeeSchema.safeParse({
    name: formData.get("name"),
    name_kana: formData.get("name_kana"),
    department: formData.get("department"),
    birth_date: formData.get("birth_date"),
    gender: formData.get("gender"),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first.message };
  }

  const { name, name_kana, department, birth_date, gender } = parsed.data;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("employees")
    .insert({
      name,
      name_kana: name_kana || null,
      department: department || null,
      birth_date: birth_date || null,
      gender: gender || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createEmployee]", error?.message);
    return { error: "登録に失敗しました。時間をおいて再度お試しください。" };
  }

  revalidatePath("/employees");
  redirect(`/employees/${data.id}`);
}
