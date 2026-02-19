import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/about", "/pricing", "/contact"];
const authRoutes = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"];
const apiAuthPrefix = "/api/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Always allow auth API routes
  if (nextUrl.pathname.startsWith(apiAuthPrefix)) return;

  // Always allow webhooks
  if (nextUrl.pathname.startsWith("/api/webhooks")) return;

  // Always allow uploadthing
  if (nextUrl.pathname.startsWith("/api/uploadthing")) return;

  // Redirect logged-in users away from auth pages
  if (authRoutes.includes(nextUrl.pathname)) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return;
  }

  // Protect admin routes
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/sign-in", nextUrl));
    }
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return;
  }

  // Protect instructor routes
  if (nextUrl.pathname.startsWith("/instructor")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/sign-in", nextUrl));
    }
    if (userRole !== "INSTRUCTOR" && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return;
  }

  // Allow public routes
  if (publicRoutes.includes(nextUrl.pathname)) return;

  // Allow API routes
  if (nextUrl.pathname.startsWith("/api")) return;

  // Protect all other routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/sign-in", nextUrl));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
