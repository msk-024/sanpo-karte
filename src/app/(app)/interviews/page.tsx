import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import InterviewRecordList, { type InterviewRecord } from "./_components/InterviewRecordList";

export const metadata: Metadata = {
  title: "面談履歴 | さんぽかるて",
};

export default async function InterviewsPage() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("interviews")
    .select(`
      id, interviewed_at, interview_type, content, plan, created_at,
      employees(id, name, name_kana, department)
    `)
    .order("interviewed_at", { ascending: false });

  if (error) {
    return (
      <p style={{ fontSize: "13px", color: "var(--color-danger)" }}>
        データの取得に失敗しました：{error.message}
      </p>
    );
  }

  const records: InterviewRecord[] = (data ?? []).flatMap((iv) => {
    const emp = Array.isArray(iv.employees) ? iv.employees[0] : iv.employees;
    if (!emp) return [];
    return [{
      id: iv.id,
      employee_id: emp.id,
      employee_name: emp.name,
      employee_name_kana: emp.name_kana,
      department: emp.department,
      interviewed_at: iv.interviewed_at,
      interview_type: iv.interview_type,
      content: iv.content,
      plan: iv.plan,
      created_at: iv.created_at,
    }];
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <h1 style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.3px" }}>
          面談履歴
        </h1>
        <p style={{ fontSize: "13px", color: "var(--muted-foreground)", marginTop: "2px" }}>
          {records.length}件の面談記録
        </p>
      </div>

      <InterviewRecordList records={records} />
    </div>
  );
}
