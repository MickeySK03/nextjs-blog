// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.role === "admin";
    const isEditor = token?.role === "editor";
    console.log("token", token);
    // Only admin can access /admin/users
    if (req.nextUrl.pathname.startsWith("/admin/users") && !isAdmin) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    // Check if the path is exactly /admin
    if (req.nextUrl.pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Require auth for all /admin routes except /admin/login
        if (req.nextUrl.pathname.startsWith("/admin/login")) return true;
        if (req.nextUrl.pathname.startsWith("/admin")) return !!token;
        return true;
      },
    },
  },
);

export const config = {
  matcher: ["/admin/:path*"],
};
