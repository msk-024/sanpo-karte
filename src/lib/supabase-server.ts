import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * サーバー側（Server Components / Server Actions）で使うSupabaseクライアント。
 * Cookieを読み書きしてセッションを維持する。
 * ブラウザ用の createClient() とは別物なので注意。
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Cookieを読み取る（セッションの確認に使用）
        getAll() {
          return cookieStore.getAll();
        },
        // Cookieを書き込む（ログイン・ログアウト時に使用）
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Componentから呼ばれた場合はCookie書き込み不可（無視してOK）
          }
        },
      },
    }
  );
}
