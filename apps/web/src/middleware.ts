import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(route + "/")
  );
  const isPublicRoute = publicRoutes.some(
    (route) => path === route || path.startsWith(route + "/")
  );

  // console.log("Access Tokens:", {
  //   accessToken: req.cookies.get("accessToken")?.value,
  //   refreshToken: req.cookies.get("refreshToken")?.value,
  // });

  // console.log("Middleware accessed for path:", path);

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  // Handle root path "/"
  if (path === "/") {
    if (accessToken || refreshToken) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    } else {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
  }

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !accessToken && !refreshToken) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set(
      "return-url",
      req.nextUrl.pathname + req.nextUrl.search
    );
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from public routes
  if (isPublicRoute && (accessToken || refreshToken)) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
