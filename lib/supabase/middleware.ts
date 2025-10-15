import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (!hasEnvVars) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, searchParams } = request.nextUrl;

  const publicPaths = [
    "/",
    "/jobs",
    "/hire",
    "/api/jobs",
    "/api/locations",
    "/api/jobs/filters",
    "/api/companies",
    "/api/companies/filters",
    "/privacy-policy",
    "/terms-of-service",
    "/sitemap.xml",
    "/blog",
    "/companies",
    "/robots.txt",
    "/opengraph-image.jpg",
    "/twitter-image.jpg",
  ];

  const authPaths = [
    "/auth/login",
    "/auth/sign-up",
    "/auth/callback",
    "/auth/sign-up-success",
    "/auth/error",
    "/auth/confirm",
    "/auth/forgot-password",
    "/auth/update-password",
    "/auth/login?company=true",
    "/auth/sign-up?company=true",
  ];

  const isAuthPath = authPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  const isApplicantOnboardingPath =
    pathname === "/get-started" &&
    !(searchParams.get("company") === "true") &&
    !(searchParams.get("edit") === "true");
  const isCompanyOnboardingPath =
    pathname === "/get-started" &&
    searchParams.get("company") === "true" &&
    !(searchParams.get("edit") === "true");

  const isJobPage =
    pathname.startsWith("/jobs/") && pathname.length > "/jobs/".length;

  const isBlogPage =
    pathname.startsWith("/blog/") && pathname.length > "/blog/".length;

  const isCompanyPage =
    pathname.startsWith("/companies/") &&
    pathname.length > "/companies/".length;

  // --- 1. Handle Unauthenticated Users ---
  if (!user) {
    // If an unauthenticated user tries to access a protected page, redirect them to login.
    if (
      !isAuthPath &&
      !publicPaths.includes(pathname) &&
      !isJobPage &&
      !isCompanyPage &&
      !isBlogPage
    ) {
      const url = request.nextUrl.clone();

      url.searchParams.forEach((value, key) => {
        url.searchParams.delete(key);
      });
      if (url.pathname.startsWith("/company")) {
        url.pathname = "/auth/login";
        url.searchParams.set("company", "true");
      } else url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // --- 2. Handle Authenticated Users ---
  if (user) {
    // Check if the user has an applicant profile
    const { data: userInfo } = await supabase
      .from("user_info")
      .select("filled")
      .eq("user_id", user.id)
      .single();

    // Check if the user has a company profile
    const { data: companyInfo } = await supabase
      .from("company_info")
      .select("filled")
      .eq("user_id", user.id)
      .single();

    const isApplicant = userInfo?.filled || false;
    const isCompany = companyInfo?.filled || false;

    // Redirect authenticated users away from auth pages
    if (isAuthPath) {
      const url = request.nextUrl.clone();
      let pathname;
      if (isApplicant === true && userInfo) {
        pathname = "/jobs";
        url.pathname = pathname;
        url.searchParams.forEach((value, key) => {
          url.searchParams.delete(key);
        });
        return NextResponse.redirect(url);
      } else if (isCompany === true && companyInfo) {
        pathname = "/company";
        url.pathname = pathname;
        url.searchParams.forEach((value, key) => {
          url.searchParams.delete(key);
        });
        return NextResponse.redirect(url);
      } else {
        url.pathname = "/get-started";
        url.searchParams.forEach((value, key) => {
          url.searchParams.delete(key);
        });

        if (companyInfo) {
          url.searchParams.set("company", "true");
        }
        return NextResponse.redirect(url);
      }
    }

    // --- Enforce Onboarding ---
    // If the user has no profile and is not on an onboarding page, redirect them.
    if (
      !isApplicant &&
      !isCompany &&
      !isApplicantOnboardingPath &&
      !publicPaths &&
      !isJobPage &&
      !isCompanyPage &&
      !isBlogPage
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/get-started";
      url.searchParams.forEach((value, key) => {
        url.searchParams.delete(key);
      });
      if (companyInfo) {
        url.searchParams.set("company", "true");
      }
      return NextResponse.redirect(url);
    }

    // --- Restrict Access to Company Routes ---
    if (pathname.startsWith("/company") && !companyInfo) {
      const url = request.nextUrl.clone();
      url.pathname = "/jobs";
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/company") && !isCompany && companyInfo) {
      const url = request.nextUrl.clone();
      url.pathname = "/get-started";
      url.searchParams.forEach((value, key) => {
        url.searchParams.delete(key);
      });
      if (companyInfo) {
        url.searchParams.set("company", "true");
      }
      return NextResponse.redirect(url);
    }

    // If a user has completed onboarding and tries to access the onboarding page, redirect them.
    if (
      (isApplicant && isApplicantOnboardingPath) ||
      (isCompany && isCompanyOnboardingPath)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = isCompany ? "/company" : "/jobs";
      url.searchParams.forEach((value, key) => {
        url.searchParams.delete(key);
      });
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
