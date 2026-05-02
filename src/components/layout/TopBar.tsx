import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { signOut } from "@/app/(app)/_actions/signOut";

/**
 * TopBar（Server Component）
 * ログイン中のユーザーのメールアドレスとログアウトボタンを表示する。
 */
export default async function TopBar() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // メールアドレスから表示名を生成（例: nurse@example.com → nurse）
  const displayName = user?.email?.split("@")[0] ?? "";

  return (
    <header
      style={{
        height: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        background: "var(--color-background-primary)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <Link href="/" style={{ textDecoration: "none" }}>
        <span
          style={{
            fontWeight: 600,
            fontSize: "16px",
            letterSpacing: "-0.3px",
            color: "var(--foreground)",
          }}
        >
          さんぽ
          <span style={{ color: "var(--color-text-info)" }}>かるて</span>
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* ログイン中のユーザー名 */}
        <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
          {displayName}
        </span>

        {/* ログアウトボタン（Server Actionをformで呼ぶ） */}
        <form action={signOut}>
          <button
            type="submit"
            style={{
              fontSize: "12px",
              padding: "4px 10px",
              borderRadius: "5px",
              border: "1px solid var(--color-border-tertiary)",
              background: "transparent",
              color: "var(--muted-foreground)",
              cursor: "pointer",
            }}
          >
            ログアウト
          </button>
        </form>
      </div>
    </header>
  );
}
