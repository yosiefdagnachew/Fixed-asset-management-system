import React from 'react';
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

type RequestWithAuth = NextRequest & { 
  nextauth: { 
    token: any 
  } 
};

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname === "/auth/login";

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null;
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/auth/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page without authentication
        if (req.nextUrl.pathname === "/auth/login") {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/auth/login"],
}; 