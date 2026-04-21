import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin Panel"' },
    });
  }

  const [username, password] = Buffer.from(authHeader.slice(6), "base64")
    .toString()
    .split(":");

  const validUser = process.env.ADMIN_USERNAME ?? "admin";
  const validPass = process.env.ADMIN_PASSWORD ?? "";

  if (username !== validUser || password !== validPass) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin Panel"' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
