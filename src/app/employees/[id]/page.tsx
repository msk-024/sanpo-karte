import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase";
import JudgmentBadge from "../_components/JudgmentBadge";
import HealthCheckTable from "./_components/HealthCheckTable";
import AddHealthCheckForm from "./_components/AddHealthCheckForm";
import InterviewList, { type Interview } from "./_components/InterviewList";
import AddInterviewForm from "./_components/AddInterviewForm";
import AiDocPanel from "./_components/AiDocPanel";
import StressCheckSection, { type StressCheck } from "./_components/StressCheckSection";
import ReturnToWorkSection, { type ReturnToWorkRecord } from "./_components/ReturnToWorkSection";
import { calcAge } from "@/lib/utils";
import { CARD_STYLE, SECTION_TITLE_STYLE } from "@/lib/styles";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = createClient();
  const { data } = await supabase
    .from("employees")
    .select("name")
    .eq("id", id)
    .single();
  return {
    title: data ? `${data.name} のカルテ | さんぽかるて` : "カルテ | さんぽかるて",
  };
}

const GENDER_LABEL: Record<string, string> = {
  male: "男性",
  female: "女性",
  other: "その他",
};

type DupeTag = "同姓同名あり" | "同姓あり" | "同名あり" | null;

function getDupeTag(name: string, others: { name: string }[]): DupeTag {
  const [family, given] = name.split(/\s+/);
  if (others.some((o) => o.name === name)) return "同姓同名あり";
  const sameFamily = family ? others.some((o) => o.name.split(/\s+/)[0] === family) : false;
  const sameGiven = given ? others.some((o) => o.name.split(/\s+/)[1] === given) : false;
  if (sameFamily) return "同姓あり";
  if (sameGiven) return "同名あり";
  return null;
}
function formatBirthDate(birthDate: string | null): string {
  if (!birthDate) return "—";
  const d = new Date(birthDate);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

const sectionTitle: React.CSSProperties = {
  ...SECTION_TITLE_STYLE,
  marginBottom: "12px",
};

export default async function EmployeeDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createClient();

  const [
    { data: emp, error: empError },
    { data: healthChecks },
    { data: interviewsRaw },
    { data: allEmployees },
    { data: stressChecksRaw },
    { data: returnToWorkRaw },
  ] = await Promise.all([
    supabase.from("employees").select("*").eq("id", id).single(),
    supabase
      .from("health_checks")
      .select("*")
      .eq("employee_id", id)
      .order("check_year", { ascending: false }),
    supabase
      .from("interviews")
      .select("*")
      .eq("employee_id", id)
      .order("interviewed_at", { ascending: false }),
    supabase.from("employees").select("id, name, name_kana"),
    supabase
      .from("stress_checks")
      .select("*")
      .eq("employee_id", id)
      .order("check_year", { ascending: false }),
    supabase
      .from("return_to_work")
      .select("*")
      .eq("employee_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const interviews: Interview[] = interviewsRaw ?? [];
  const stressChecks: StressCheck[] = (stressChecksRaw ?? []) as StressCheck[];
  const returnToWorkRecords: ReturnToWorkRecord[] = (returnToWorkRaw ?? []) as ReturnToWorkRecord[];

  if (empError || !emp) notFound();

  const sortedEmployees = [...(allEmployees ?? [])].sort((a, b) =>
    (a.name_kana ?? a.name).localeCompare(b.name_kana ?? b.name, "ja")
  );
  const currentIndex = sortedEmployees.findIndex((e) => e.id === id);
  const prevEmp = currentIndex > 0 ? sortedEmployees[currentIndex - 1] : null;
  const nextEmp = currentIndex < sortedEmployees.length - 1 ? sortedEmployees[currentIndex + 1] : null;

  const others = sortedEmployees.filter((e) => e.id !== id);
  const dupeTag = getDupeTag(emp.name, others);

  const age = calcAge(emp.birth_date ?? null);
  const latestJudgment = healthChecks?.[0]?.judgment ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* パンくず + 前後ナビ */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "12px",
          color: "var(--muted-foreground)",
        }}
      >
        <div>
          <Link
            href="/employees"
            style={{ color: "var(--color-text-info)", textDecoration: "none" }}
          >
            従業員一覧
          </Link>
          <span style={{ margin: "0 6px" }}>›</span>
          <span>{emp.name}</span>
        </div>

        <div style={{ display: "flex", gap: "4px" }}>
          {prevEmp ? (
            <Link
              href={`/employees/${prevEmp.id}`}
              title={prevEmp.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 10px",
                borderRadius: "20px",
                border: "0.5px solid var(--color-border-tertiary)",
                textDecoration: "none",
                color: "var(--foreground)",
                fontSize: "12px",
                transition: "background 0.15s",
              }}
            >
              ‹ {prevEmp.name}
            </Link>
          ) : (
            <span
              style={{
                padding: "4px 10px",
                borderRadius: "20px",
                border: "0.5px solid var(--color-border-tertiary)",
                color: "var(--muted-foreground)",
                fontSize: "12px",
                opacity: 0.4,
              }}
            >
              ‹
            </span>
          )}
          {nextEmp ? (
            <Link
              href={`/employees/${nextEmp.id}`}
              title={nextEmp.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 10px",
                borderRadius: "20px",
                border: "0.5px solid var(--color-border-tertiary)",
                textDecoration: "none",
                color: "var(--foreground)",
                fontSize: "12px",
                transition: "background 0.15s",
              }}
            >
              {nextEmp.name} ›
            </Link>
          ) : (
            <span
              style={{
                padding: "4px 10px",
                borderRadius: "20px",
                border: "0.5px solid var(--color-border-tertiary)",
                color: "var(--muted-foreground)",
                fontSize: "12px",
                opacity: 0.4,
              }}
            >
              ›
            </span>
          )}
        </div>
      </nav>

      {/* プロフィールヘッダー */}
      <div
        style={{
          ...CARD_STYLE,
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {/* アバター */}
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            background: "var(--color-background-info)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--color-text-info)",
            flexShrink: 0,
          }}
        >
          {emp.name.charAt(0)}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: 600,
                letterSpacing: "-0.3px",
              }}
            >
              {emp.name}
            </h1>
            <JudgmentBadge judgment={latestJudgment} />
            {dupeTag && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  background: "#FAEEDA",
                  color: "#C07A00",
                  padding: "2px 8px",
                  borderRadius: "20px",
                  whiteSpace: "nowrap",
                }}
              >
                {dupeTag}
              </span>
            )}
          </div>
          {emp.name_kana && (
            <p style={{ fontSize: "12px", color: "var(--muted-foreground)", marginTop: "2px", letterSpacing: "0.5px" }}>
              {emp.name_kana}
            </p>
          )}
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "4px",
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "部署", value: emp.department ?? "—" },
              {
                label: "性別",
                value: emp.gender
                  ? (GENDER_LABEL[emp.gender] ?? emp.gender)
                  : "—",
              },
              {
                label: "生年月日",
                value: age !== null
                  ? `${formatBirthDate(emp.birth_date ?? null)}（${age}歳）`
                  : "—",
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{ display: "flex", gap: "4px", fontSize: "13px" }}
              >
                <span style={{ color: "var(--muted-foreground)" }}>
                  {label}：
                </span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 健診結果 */}
      <div style={CARD_STYLE}>
        <p style={sectionTitle}>健診結果履歴</p>
        <HealthCheckTable healthChecks={healthChecks ?? []} />
        <div style={{ marginTop: "12px" }}>
          <AddHealthCheckForm employeeId={id} />
        </div>
      </div>

      {/* 面談記録 */}
      <div style={CARD_STYLE}>
        <p style={sectionTitle}>面談記録</p>
        <InterviewList interviews={interviews} />
        <div style={{ marginTop: "12px" }}>
          <AddInterviewForm employeeId={id} />
        </div>
      </div>

      {/* ストレスチェック */}
      <div style={CARD_STYLE}>
        <p style={sectionTitle}>ストレスチェック結果</p>
        <StressCheckSection employeeId={id} checks={stressChecks} />
      </div>

      {/* 復職支援 */}
      <div style={CARD_STYLE}>
        <p style={sectionTitle}>復職支援記録</p>
        <ReturnToWorkSection employeeId={id} records={returnToWorkRecords} />
      </div>

      {/* AI文書生成 */}
      <div style={CARD_STYLE}>
        <p style={sectionTitle}>AI文書生成</p>
        <AiDocPanel
          employeeName={emp.name}
          latestJudgment={latestJudgment}
        />
      </div>
    </div>
  );
}
