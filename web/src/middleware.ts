import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/"];
const publicRoutes = ["/login"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      path === route ||
      (path.startsWith(route + "/") && publicRoutes.includes(route))
  );
  const isPublicRoute = publicRoutes.some(
    (route) => path === route || path.startsWith(route + "/")
  );

  console.log("Middleware accessed for path:", path);

  const accessToken = req.cookies.get("access-token")?.value;
  const role = req.cookies.get("role")?.value;

  // Redirect unauthenticated users from protected routes

  // if (isProtectedRoute && !accessToken) {
  //   const loginUrl = new URL("/login", req.nextUrl);
  //   loginUrl.searchParams.set(
  //     "return-url",
  //     req.nextUrl.pathname + req.nextUrl.search
  //   );
  //   return NextResponse.redirect(loginUrl);
  // }

  // if (isPublicRoute && accessToken) {
  //   if (role === "applicant") {
  //     return NextResponse.redirect(new URL("/home", req.nextUrl));
  //   } else if (role === "recruiter") {
  //     return NextResponse.redirect(new URL("/recruiter", req.nextUrl));
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
