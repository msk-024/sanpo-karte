import { createClient } from "@/lib/supabase";
import GreetingBar from "./_components/GreetingBar";
import DonutChartsRow, { type ChartData } from "./_components/DonutChartsRow";
import TodaySchedule, { type Interview } from "./_components/TodaySchedule";
import AlertPanel, { type Alert } from "./_components/AlertPanel";
import AiAssistPanel from "./_components/AiAssistPanel";
import RecentActivity, { type Activity } from "./_components/RecentActivity";

const MOCK_ACTIVITY: Activity[] = [
  { text: "田中 花子の面談記録を作成しました", time: "今日 9:30" },
  { text: "山田 次郎の健診データを更新しました", time: "今日 8:15" },
  { text: "鈴木 三郎に受診勧奨文を送付しました", time: "昨日" },
  { text: "4月の定期面談スケジュールを設定しました", time: "4月7日" },
];

const TYPE_LABELS: Record<string, string> = {
  routine: "定期面談",
  mental: "メンタル相談",
  referral: "受診勧奨後フォロー",
  other: "その他",
};

export default async function Home() {
  const supabase = createClient();
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const [
    { data: employees },
    { data: healthChecks },
    { data: todayIvs },
    { data: allIvs },
  ] = await Promise.all([
    supabase.from("employees").select("id, name, department"),
    supabase.from("health_checks").select("judgment, employee_id, check_year"),
    supabase
      .from("interviews")
      .select("id, interview_type, employees(id, name)")
      .eq("interviewed_at", today),
    supabase.from("interviews").select("employee_id, interviewed_at"),
  ]);

  const emps = employees ?? [];
  const hcs = healthChecks ?? [];
  const ivs = allIvs ?? [];

  // 健診判定集計
  const totalEmployees = emps.length;
  const judgmentCounts = { A: 0, B: 0, C: 0, D: 0 };

  // 従業員ごとの最新判定
  const latestJudgment = new Map<string, string>();
  for (const hc of [...hcs].sort((a, b) => b.check_year - a.check_year)) {
    if (!latestJudgment.has(hc.employee_id)) {
      latestJudgment.set(hc.employee_id, hc.judgment);
    }
  }
  for (const j of latestJudgment.values()) {
    const k = j as keyof typeof judgmentCounts;
    if (k in judgmentCounts) judgmentCounts[k]++;
  }

  const inputted = judgmentCounts.A + judgmentCounts.B + judgmentCounts.C + judgmentCounts.D;
  const inputRate = totalEmployees > 0 ? Math.round((inputted / totalEmployees) * 100) : 0;

  // 従業員ごとの最終面談日
  const lastInterview = new Map<string, string>();
  for (const iv of [...ivs].sort(
    (a, b) => new Date(b.interviewed_at).getTime() - new Date(a.interviewed_at).getTime()
  )) {
    if (!lastInterview.has(iv.employee_id)) {
      lastInterview.set(iv.employee_id, iv.interviewed_at);
    }
  }

  // 今日の面談予定（実データ）
  const todayInterviews: Interview[] = (todayIvs ?? []).flatMap((iv) => {
    const emp = Array.isArray(iv.employees) ? iv.employees[0] : iv.employees;
    if (!emp) return [];
    return [{
      id: emp.id,
      name: emp.name,
      reason: TYPE_LABELS[iv.interview_type] ?? "面談",
    }];
  });

  // 要対応アラート（C/D判定の実データ、最大5件）
  const realAlerts: Alert[] = emps
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
      const isDanger = j === "D" || daysSince === null || daysSince > 60;
      return {
        id: e.id,
        name: e.name,
        reason: `${j}判定${lastDate ? `・${daysSince}日前` : "・面談未実施"}`,
        days: daysSince,
        level: isDanger ? "danger" : "warning",
      } as Alert;
    })
    .sort((a, b) => {
      if (a.level !== b.level) return a.level === "danger" ? -1 : 1;
      if (a.days === null) return -1;
      if (b.days === null) return 1;
      return b.days - a.days;
    })
    .slice(0, 5);

  const hour = now.getHours();
  const greeting = hour < 12 ? "おはようございます" : hour < 18 ? "こんにちは" : "こんばんは";
  const DAYS = ["日", "月", "火", "水", "木", "金", "土"];
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日（${DAYS[now.getDay()]}）`;

  const charts: ChartData[] = [
    {
      title: "健診判定内訳",
      segments: [
        { value: judgmentCounts.A, color: "#639922", label: "A判定" },
        { value: judgmentCounts.B, color: "#D85A30", label: "B判定" },
        { value: judgmentCounts.C, color: "#EF9F27", label: "C判定" },
        { value: judgmentCounts.D, color: "#E24B4A", label: "D判定" },
      ],
      centerValue: totalEmployees,
      centerLabel: "総人数",
      href: "/health",
    },
    {
      title: "要フォロー状況",
      segments: [
        { value: 5, color: "#E24B4A", label: "要対応" },
        { value: 8, color: "#EF9F27", label: "面談待ち" },
        { value: 12, color: "#639922", label: "対応済" },
      ],
      centerValue: 5,
      centerLabel: "要対応",
      href: "/reports",
    },
    {
      title: "今月の面談進捗",
      segments: [
        { value: 7, color: "#639922", label: "完了" },
        { value: 8, color: "#EF9F27", label: "未完了" },
      ],
      centerValue: 8,
      centerLabel: "未完了",
      href: "/interviews",
    },
    {
      title: "健診データ入力率",
      segments: [
        { value: inputted, color: "#378ADD", label: "入力済" },
        { value: Math.max(0, totalEmployees - inputted), color: "#E5E7EB", label: "未入力" },
      ],
      centerValue: `${inputRate}%`,
      href: "/health",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <GreetingBar
        greeting={greeting}
        dateStr={dateStr}
        interviewCount={todayInterviews.length}
      />
      <DonutChartsRow charts={charts} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <TodaySchedule interviews={todayInterviews} />
        <AlertPanel alerts={realAlerts} />
      </div>
      <AiAssistPanel />
      <RecentActivity activities={MOCK_ACTIVITY} />
    </div>
  );
}
