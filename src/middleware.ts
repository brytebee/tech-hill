// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const pathname = req.nextUrl.pathname;

    const isAuthPage =
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/auth");

    // Allow access to home page without authentication
    if (pathname === "/") {
      return null;
    }

    // If on auth page and already authenticated, redirect to role-based route
    if (isAuthPage && isAuth) {
      const role = token.role?.toLowerCase();
      return NextResponse.redirect(new URL(`/${role}`, req.url));
    }

    // Handle /dashboard route - redirect to role-based route
    if (pathname === "/dashboard" && isAuth) {
      const role = token.role?.toLowerCase();
      return NextResponse.redirect(new URL(`/${role}`, req.url));
    }

    // Check if trying to access protected routes without auth
    if (!isAuth && !isAuthPage) {
      let from = pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    // Role-based access control
    const userRole = token?.role;

    // Admin routes - only admins
    if (pathname.startsWith("/admin")) {
      if (userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Manager routes - admins and managers
    if (pathname.startsWith("/manager")) {
      if (userRole !== "ADMIN" && userRole !== "MANAGER") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Student routes - all authenticated users can access
    if (pathname.startsWith("/student")) {
      return null;
    }

    // API routes protection
    if (pathname.startsWith("/api/admin") && userRole !== "ADMIN") {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }

    if (
      pathname.startsWith("/api/manager") &&
      userRole !== "ADMIN" &&
      userRole !== "MANAGER"
    ) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }

    // Check user status (only for authenticated users)
    if (isAuth && token?.status !== "ACTIVE") {
      return NextResponse.redirect(new URL("/auth/suspended", req.url));
    }

    return null;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Allow access to public pages
        if (
          pathname === "/" ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/auth")
        ) {
          return true;
        }

        // For all other routes, require a valid token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)"],
};
