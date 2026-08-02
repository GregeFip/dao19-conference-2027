import { env } from "cloudflare:workers";
import {
  createAdminSessionCookie,
  safeAdminReturnPath,
  verifyAdminPasswordProof,
} from "../../../admin-auth";

type RateLimitBinding = {
  limit(options: { key: string }): Promise<{ success: boolean }>;
};

type SessionRuntimeEnv = {
  LOGIN_RATE_LIMITER?: RateLimitBinding;
};

function redirectToLogin(error: string, returnTo: string): Response {
  const location = `/admin/login?error=${encodeURIComponent(error)}&return_to=${encodeURIComponent(returnTo)}`;
  return new Response(null, { status: 303, headers: { location, "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const passwordProof = String(formData.get("passwordProof") || "").slice(0, 128);
  const returnTo = safeAdminReturnPath(String(formData.get("returnTo") || "/admin"));
  const runtime = env as unknown as SessionRuntimeEnv;
  const clientKey = request.headers.get("cf-connecting-ip") || "unknown-client";
  const rateLimit = runtime.LOGIN_RATE_LIMITER
    ? await runtime.LOGIN_RATE_LIMITER.limit({ key: `admin:${clientKey}` })
    : { success: true };

  if (!rateLimit.success) return redirectToLogin("limited", returnTo);
  if (!(await verifyAdminPasswordProof(passwordProof))) return redirectToLogin("invalid", returnTo);

  const sessionCookie = await createAdminSessionCookie();
  if (!sessionCookie) return redirectToLogin("configuration", returnTo);

  return new Response(null, {
    status: 303,
    headers: { location: returnTo, "set-cookie": sessionCookie, "cache-control": "no-store" },
  });
}
