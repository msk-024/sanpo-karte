import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import HealthCheckList, { type HealthCheckRecord } from "./_components/HealthCheckList";

export const metadata: Metadata = {
  title: "健診結果 | さんぽかるて",
};

export default async function HealthPage() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("health_checks")
    .select(`
      id, check_year, judgment, bmi,
      blood_pressure_sys, blood_pressure_dia,
      blood_sugar, total_cholesterol, notes,
      employees(id, name, name_kana, department)
    `)
    .order("check_year", { ascending: false });

  if (error) {
    return (
      <p style={{ fontSize: "13px", color: "var(--color-danger)" }}>
        データの取得に失敗しました：{error.message}
      </p>
    );
  }

  const records: HealthCheckRecord[] = (data ?? []).flatMap((hc) => {
    const emp = Array.isArray(hc.employees) ? hc.employees[0] : hc.employees;
    if (!emp) return [];
    return [{
      id: hc.id,
      employee_id: emp.id,
      employee_name: emp.name,
      employee_name_kana: emp.name_kana,
      department: emp.department,
      check_year: hc.check_year,
      judgment: hc.judgment,
      bmi: hc.bmi,
      blood_pressure_sys: hc.blood_pressure_sys,
      blood_pressure_dia: hc.blood_pressure_dia,
      blood_sugar: hc.blood_sugar,
      total_cholesterol: hc.total_cholesterol,
      notes: hc.notes,
    }];
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.3px" }}>
            健診結果
          </h1>
          <p style={{ fontSize: "13px", color: "var(--muted-foreground)", marginTop: "2px" }}>
            {records.length}件のデータ
          </p>
        </div>
        <Link
          href="/employees/new"
          style={{
            padding: "7px 16px",
            borderRadius: "20px",
            background: "var(--color-text-info)",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          ＋ 従業員を登録
        </Link>
      </div>

      <HealthCheckList records={records} />
    </div>
  );
}
