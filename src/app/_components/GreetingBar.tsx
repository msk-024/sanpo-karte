export default function GreetingBar({
  greeting,
  dateStr,
  interviewCount,
}: {
  greeting: string;
  dateStr: string;
  interviewCount: number;
}) {
  return (
    <div>
      <h1 style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.3px" }}>
        {greeting}
      </h1>
      <p style={{ fontSize: "13px", color: "var(--muted-foreground)", marginTop: "3px" }}>
        今日は{dateStr}です。面談が{interviewCount}件入っています。
      </p>
    </div>
  );
}
