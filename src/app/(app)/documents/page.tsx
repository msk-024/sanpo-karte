import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import DocumentComposer, { type EmployeeOption } from "./_components/DocumentComposer";

export const metadata: Metadata = {
  title: "文書作成 | さんぽかるて",
};

export default async function DocumentsPage() {
  const supabase = await createServerSupabaseClient();

  const [{ data: empData }, { data: ivData }] = await Promise.all([
    supabase
      .from("employees")
      .select("id, name, name_kana, department, gender, birth_date, health_checks(judgment, check_year)"),
    supabase
      .from("interviews")
      .select("employee_id, interviewed_at")
      .order("interviewed_at", { ascending: false }),
  ]);

  // 従業員ごとの最終面談日
  const lastInterviewMap = new Map<string, string>();
  for (const iv of ivData ?? []) {
    if (!lastInterviewMap.has(iv.employee_id)) {
      lastInterviewMap.set(iv.employee_id, iv.interviewed_at);
    }
  }

  const employees: EmployeeOption[] = (empData ?? [])
    .map((emp) => {
      const sorted = [...(emp.health_checks ?? [])].sort(
        (a, b) => b.check_year - a.check_year
      );
      return {
        id: emp.id,
        name: emp.name,
        name_kana: emp.name_kana,
        department: emp.department,
        gender: emp.gender,
        birth_date: emp.birth_date,
        latest_judgment: sorted[0]?.judgment ?? null,
        last_interview_date: lastInterviewMap.get(emp.id) ?? null,
      };
    })
    .sort((a, b) =>
      (a.name_kana ?? a.name).localeCompare(b.name_kana ?? b.name, "ja")
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <h1 style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.3px" }}>
          文書作成
        </h1>
        <p style={{ fontSize: "13px", color: "var(--muted-foreground)", marginTop: "2px" }}>
          AIを使って産業保健文書を作成します
        </p>
      </div>
      <DocumentComposer employees={employees} />
    </div>
  );
}
