import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import EmployeeList, { type Employee } from "./_components/EmployeeList";

export const metadata: Metadata = {
  title: "従業員一覧 | さんぽかるて",
};

export default async function EmployeesPage() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("employees")
    .select(
      `
      id,
      name,
      name_kana,
      department,
      birth_date,
      gender,
      created_at,
      health_checks(judgment, check_year)
    `
    );

  if (error) {
    return (
      <p style={{ fontSize: "13px", color: "var(--color-danger)" }}>
        データの取得に失敗しました：{error.message}
      </p>
    );
  }

  // 各従業員の最新判定を抽出
  const employees: Employee[] = (data ?? [])
    .map((emp) => {
      const sorted = [...(emp.health_checks ?? [])].sort(
        (a, b) => b.check_year - a.check_year
      );
      return {
        id: emp.id,
        name: emp.name,
        name_kana: emp.name_kana,
        department: emp.department,
        birth_date: emp.birth_date,
        gender: emp.gender,
        created_at: emp.created_at,
        latest_judgment: sorted[0]?.judgment ?? null,
      };
    })
    .sort((a, b) =>
      (a.name_kana ?? a.name).localeCompare(b.name_kana ?? b.name, "ja")
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* ページヘッダー */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "18px",
              fontWeight: 600,
              letterSpacing: "-0.3px",
            }}
          >
            従業員一覧
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "var(--muted-foreground)",
              marginTop: "2px",
            }}
          >
            {employees.length}名登録済み
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
            transition: "opacity 0.15s",
          }}
        >
          ＋ 新規登録
        </Link>
      </div>

      <EmployeeList employees={employees} />
    </div>
  );
}
