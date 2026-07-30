import { clearAdminSessionCookie, safePublicReturnPath } from "../../../../admin-auth";

export async function GET(request: Request) {
  const returnTo = safePublicReturnPath(new URL(request.url).searchParams.get("return_to") || "/");
  return new Response(null, {
    status: 303,
    headers: {
      location: returnTo,
      "set-cookie": clearAdminSessionCookie(),
      "cache-control": "no-store",
    },
  });
}
