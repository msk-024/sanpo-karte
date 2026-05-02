import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * proxy.ts（Next.js 16の認証ゲート）
 *
 * 全リクエストの前に実行される。
 * ・未ログイン → /login にリダイレクト
 * ・ログイン済みで /login にアクセス → / にリダイレクト
 * ・それ以外 → そのまま通過
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // レスポンスを先に作っておく（Supabaseがセッション更新時にCookieを書き込むため）
  const response = NextResponse.next();

  // proxy内でSupabaseクライアントを直接作成（cookieストアに request/response を渡す）
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // セッション更新時のCookieをレスポンスにセット
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // セッションを確認（getUser はサーバー側で検証するため安全）
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 未ログインかつ /login 以外のページ → ログインページへ
  if (!user && !pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ログイン済みで /login にアクセス → ホームへ
  if (user && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

// 静的ファイル・画像最適化は対象外
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
