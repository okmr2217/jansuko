import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "session";

// 認証不要なパス
const publicPaths = ["/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 静的ファイルやAPIルートは除外
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // 未認証でプライベートパスにアクセスした場合
  if (!sessionCookie && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 認証済みでログインページにアクセスした場合
  if (sessionCookie && pathname === "/login") {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
