import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATH_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

const PROTECTED_PREFIXES = [
  "/studio",
  "/collection",
  "/discover",
  "/calendar",
  "/dashboard",
];

const ONBOARDING_PATH = "/onboarding";

function isPublicPath(pathname: string) {
  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/api") ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$/i.test(pathname)
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  if (isStaticAsset(pathname)) {
    return supabaseResponse;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("[proxy] pathname =", pathname);
  console.log("[proxy] user =", user?.id ?? null);
  console.log("[proxy] userError =", userError?.message ?? null);

  if (!user) {
    if (pathname.startsWith(ONBOARDING_PATH) || isProtectedPath(pathname)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      console.log("[proxy] redirect -> /login");
      return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profile")
    .select("category, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  console.log("[proxy] profile =", profile);
  console.log("[proxy] profileError =", profileError?.message ?? null);

  const needsOnboarding =
    !!profileError || !profile?.category || !profile?.onboarding_completed;

  console.log("[proxy] needsOnboarding =", needsOnboarding);

  if (needsOnboarding) {
    if (!pathname.startsWith(ONBOARDING_PATH) && !isPublicPath(pathname)) {
      const onboardingUrl = request.nextUrl.clone();
      onboardingUrl.pathname = ONBOARDING_PATH;
      onboardingUrl.searchParams.set("from", pathname);
      console.log("[proxy] redirect -> /onboarding");
      return NextResponse.redirect(onboardingUrl);
    }

    return supabaseResponse;
  }

  if (pathname.startsWith(ONBOARDING_PATH)) {
    const studioUrl = request.nextUrl.clone();
    studioUrl.pathname = "/studio";
    console.log("[proxy] redirect -> /studio");
    return NextResponse.redirect(studioUrl);
  }

  return supabaseResponse;
}
