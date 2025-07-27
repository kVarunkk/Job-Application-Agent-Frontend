import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils"; // Assuming this utility exists

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip middleware check. You can remove this once you setup the project.
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

  // Paths that are always public (no auth required)
  const publicPaths = [
    "/", // Homepage
    "/jobs", // Main jobs board (assuming it can show public jobs)
    "/api/jobs", // API route for jobs (might be public or handle auth internally)
  ];

  // Paths related to authentication (login, signup, callback)
  const authPaths = ["/auth/login", "/auth/signup", "/auth/callback"];

  // Check if the current path is an auth path
  const isAuthPath = authPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  const isGetStartedBasePage =
    pathname === "/get-started" || pathname === "/get-started/"; // The base /get-started page
  const isGetStartedEditMode = isGetStartedBasePage && searchParams.has("edit"); // Check for '?edit' query param

  // --- 1. Handle Unauthenticated Users ---
  if (!user) {
    // If no user is logged in AND it's not an auth path or public path, redirect to login.
    // Allow access to public/auth paths if unauthenticated.
    // The /get-started page itself (base or edit mode) is considered a protected page
    // that requires authentication.
    if (
      !isAuthPath &&
      !publicPaths.includes(pathname) &&
      !isGetStartedBasePage
    ) {
      // Added !isGetStartedBasePage here
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // --- 2. Handle Authenticated Users (check user_info) ---
  // If we reach here, 'user' is guaranteed to exist.

  // Fetch user_info
  const { data: userInfo, error: userInfoError } = await supabase
    .from("user_info")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  if (userInfoError && userInfoError.code !== "PGRST116") {
    console.error("Error fetching user_info in middleware:", userInfoError);
    // You might want to redirect to a generic error page or log out the user
    // if there's a serious DB error here. For now, we'll let it pass but log.
  }

  // If user is logged in, but no user_info record exists, AND they are not on the /get-started page,
  // redirect them to /get-started.
  if (!userInfo && !isGetStartedBasePage) {
    const url = request.nextUrl.clone();
    url.pathname = "/get-started";
    return NextResponse.redirect(url);
  }

  // If user is logged in, and they *do* have a user_info record,
  // AND they are trying to access the /get-started page,
  // redirect them away (e.g., to the jobs board or dashboard) as onboarding is complete.
  if (userInfo && isGetStartedBasePage && !isGetStartedEditMode) {
    const url = request.nextUrl.clone();
    url.pathname = "/jobs"; // Or '/dashboard'
    return NextResponse.redirect(url);
  }

  // If none of the above conditions triggered a redirect, allow the request to proceed.
  return supabaseResponse;
}
