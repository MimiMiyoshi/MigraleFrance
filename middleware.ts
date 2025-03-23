import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// 認証が不要なパブリックルート
const publicRoutes = [
  "/", // トップページ
  "/login", // ログインページ
  "/api/auth", // 認証API
];

// アセットファイルのパターン
const assetPatterns = [
  /^\/favicon\.ico$/,
  /^\/assets\//,
  /^\/images\//,
  /^\/fonts\//,
  /^\/icons\//,
  /^\/_next\//,
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // アセットファイルはスキップ
  if (assetPatterns.some((pattern) => pattern.test(pathname))) {
    return NextResponse.next();
  }

  // APIルートの処理
  if (pathname.startsWith("/api/")) {
    // 認証APIはスキップ
    if (pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    // その他のAPIは認証チェック
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // パブリックルートはスキップ
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // 認証チェック
  const token = await getToken({ req: request });

  // 未認証の場合はログインページにリダイレクト
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 認証済みユーザーがログインページにアクセスした場合はダッシュボードにリダイレクト
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// ミドルウェアを適用するパスを設定
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. _next/static (static files)
     * 2. _next/image (image optimization files)
     * 3. favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
