import type { Metadata } from "next";
import { createClient } from "@/lib/supabase";
import DonutChart from "../_components/DonutChart";
import DeptBreakdown, { type DeptRow } from "./_components/DeptBreakdown";
import YearTrend, { type YearRow } from "./_components/YearTrend";
import FollowUpList, { type FollowUpEmployee } from "./_components/FollowUpList";
import { CARD_STYLE, SECTION_TITLE_STYLE } from "@/lib/styles";

export const metadata: Metadata = {
  title: "レポート | さんぽかるて",
};

const card = CARD_STYLE;
const sectionTitle = SECTION_TITLE_STYLE;

export default async function ReportsPage() {
  const supabase = createClient();

  const [{ data: employees }, { data: healthChecks }, { data: interviews }] =
    await Promise.all([
      supabase.from("employees").select("id, name, name_kana, department"),
      supabase.from("health_checks").select("employee_id, check_year, judgment"),
      supabase.from("interviews").select("employee_id, interviewed_at, interview_type"),
    ]);

  const emps = employees ?? [];
  const hcs = healthChecks ?? [];
  const ivs = interviews ?? [];

  // ── 従業員ごとの最新判定 ──────────────────────────────
  const latestJudgment = new Map<string, string>();
  for (const hc of [...hcs].sort((a, b) => b.check_year - a.check_year)) {
    if (!latestJudgment.has(hc.employee_id)) {
      latestJudgment.set(hc.employee_id, hc.judgment);
    }
  }

  // ── 従業員ごとの最終面談日 ──────────────────────────────
  const lastInterview = new Map<string, string>();
  for (const iv of [...ivs].sort(
    (a, b) => new Date(b.interviewed_at).getTime() - new Date(a.interviewed_at).getTime()
  )) {
    if (!lastInterview.has(iv.employee_id)) {
      lastInterview.set(iv.employee_id, iv.interviewed_at);
    }
  }

  // ── サマリー ──────────────────────────────────────────
  const totalEmployees = emps.length;
  const withData = latestJudgment.size;
  const inputRate = totalEmployees > 0 ? Math.round((withData / totalEmployees) * 100) : 0;

  const judgmentCounts = { A: 0, B: 0, C: 0, D: 0 };
  for (const j of latestJudgment.values()) {
    const k = j as keyof typeof judgmentCounts;
    if (k in judgmentCounts) judgmentCounts[k]++;
  }
  const cdCount = judgmentCounts.C + judgmentCounts.D;

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const interviewsThisMonth = ivs.filter((iv) =>
    iv.interviewed_at.startsWith(thisMonth)
  ).length;

  // 要フォロー対応状況（C/D中: 90日以内に面談あり vs なし）
  const cdEmps = emps.filter((e) => {
    const j = latestJudgment.get(e.id);
    return j === "C" || j === "D";
  });
  const cdFollowedUp = cdEmps.filter((e) => {
    const last = lastInterview.get(e.id);
    if (!last) return false;
    const days = Math.floor((now.getTime() - new Date(last).getTime()) / 86400000);
    return days <= 90;
  }).length;
  const cdNotFollowedUp = cdCount - cdFollowedUp;

  // 今年の面談実施状況
  const thisYear = now.getFullYear();
  const interviewedThisYear = new Set(
    ivs
      .filter((iv) => new Date(iv.interviewed_at).getFullYear() === thisYear)
      .map((iv) => iv.employee_id)
  );
  const interviewedCount = interviewedThisYear.size;
  const notInterviewedCount = totalEmployees - interviewedCount;

  // ── 部署別集計 ───────────────────────────────────────
  const depts = [...new Set(emps.map((e) => e.department ?? "未設定"))].sort();
  const deptRows: DeptRow[] = depts.map((dept) => {
    const deptEmps = emps.filter((e) => (e.department ?? "未設定") === dept);
    const counts = { A: 0, B: 0, C: 0, D: 0, none: 0 };
    for (const emp of deptEmps) {
      const j = latestJudgment.get(emp.id);
      if (j === "A" || j === "B" || j === "C" || j === "D") counts[j]++;
      else counts.none++;
    }
    return { dept, total: deptEmps.length, ...counts };
  });

  // ── 年度別推移 ───────────────────────────────────────
  const years = [...new Set(hcs.map((hc) => hc.check_year))].sort((a, b) => a - b);
  const yearRows: YearRow[] = years.map((year) => {
    const yearHcs = hcs.filter((hc) => hc.check_year === year);
    const counts = { A: 0, B: 0, C: 0, D: 0 };
    for (const hc of yearHcs) {
      const j = hc.judgment as keyof typeof counts;
      if (j in counts) counts[j]++;
    }
    return { year, total: yearHcs.length, ...counts };
  });

  // ── 要フォロー者一覧（C/D判定） ────────────────────────
  const followUps: FollowUpEmployee[] = emps
    .filter((e) => {
      const j = latestJudgment.get(e.id);
      return j === "C" || j === "D";
    })
    .map((e) => {
      const j = latestJudgment.get(e.id)!;
      const lastDate = lastInterview.get(e.id) ?? null;
      const daysSince = lastDate
        ? Math.floor((now.getTime() - new Date(lastDate).getTime()) / 86400000)
        : null;
      return {
        id: e.id,
        name: e.name,
        name_kana: e.name_kana,
        department: e.department,
        judgment: j,
        last_interview_date: lastDate,
        days_since_interview: daysSince,
      };
    })
    .sort((a, b) => {
      // D判定を優先、同じ判定内では経過日数が長い順（未実施は最優先）
      if (a.judgment !== b.judgment) return a.judgment === "D" ? -1 : 1;
      if (a.days_since_interview === null) return -1;
      if (b.days_since_interview === null) return 1;
      return b.days_since_interview - a.days_since_interview;
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <h1 style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.3px" }}>
          レポート
        </h1>
        <p style={{ fontSize: "13px", color: "var(--muted-foreground)", marginTop: "2px" }}>
          産業保健活動の状況サマリー
        </p>
      </div>

      {/* ドーナツグラフ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
        <div style={card}>
          <DonutChart
            title="健診判定分布"
            segments={[
              { value: judgmentCounts.A, color: "#639922", label: "A判定" },
              { value: judgmentCounts.B, color: "#D85A30", label: "B判定" },
              { value: judgmentCounts.C, color: "#EF9F27", label: "C判定" },
              { value: judgmentCounts.D, color: "#E24B4A", label: "D判定" },
            ]}
            centerValue={withData}
            centerLabel="データあり"
          />
        </div>
        <div style={card}>
          <DonutChart
            title="健診入力率"
            segments={[
              { value: withData, color: "#378ADD", label: "入力済" },
              { value: Math.max(0, totalEmployees - withData), color: "#E5E7EB", label: "未入力" },
            ]}
            centerValue={`${inputRate}%`}
          />
        </div>
        <div style={card}>
          <DonutChart
            title="要フォロー対応状況"
            segments={[
              { value: cdFollowedUp, color: "#639922", label: "対応済（90日以内）" },
              { value: cdNotFollowedUp, color: "#E24B4A", label: "未対応" },
            ]}
            centerValue={cdCount}
            centerLabel="要フォロー"
          />
        </div>
        <div style={card}>
          <DonutChart
            title={`${thisYear}年 面談実施状況`}
            segments={[
              { value: interviewedCount, color: "#378ADD", label: "実施済" },
              { value: Math.max(0, notInterviewedCount), color: "#E5E7EB", label: "未実施" },
            ]}
            centerValue={interviewsThisMonth}
            centerLabel="今月実施"
          />
        </div>
      </div>

      {/* 要フォロー者一覧 */}
      <div style={card}>
        <p style={sectionTitle}>要フォロー者一覧（C/D判定）</p>
        <FollowUpList employees={followUps} />
      </div>

      {/* 部署別集計 */}
      <div style={card}>
        <p style={sectionTitle}>部署別健診状況</p>
        <DeptBreakdown rows={deptRows} />
      </div>

      {/* 年度別推移 */}
      <div style={card}>
        <p style={sectionTitle}>年度別判定推移</p>
        <YearTrend rows={yearRows} />
      </div>
    </div>
  );
}
