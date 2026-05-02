import TopBar from "@/components/layout/TopBar";
import TwoColumnLayout from "@/components/layout/TwoColumnLayout";

// 認証済みユーザー向けレイアウト（ヘッダー＋サイドナビあり）
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopBar />
      <TwoColumnLayout>{children}</TwoColumnLayout>
    </>
  );
}
