import { env } from "cloudflare:workers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type AdminUser = {
  displayName: string;
  email: string;
};

type AdminRuntimeEnv = {
  ADMIN_EMAIL?: string;
  ADMIN_NAME?: string;
  ADMIN_PASSWORD_HASH?: string;
  ADMIN_PASSWORD_SALT?: string;
  ADMIN_SESSION_SECRET?: string;
};

type SessionPayload = {
  email: string;
  name: string;
  expiresAt: number;
};

const COOKIE_NAME = "__Host-dao_admin";
const SESSION_SECONDS = 12 * 60 * 60;
const LOGIN_PATH = "/admin/login";
const LOGOUT_PATH = "/api/admin/session/logout";
const encoder = new TextEncoder();

function runtimeConfig(): AdminRuntimeEnv {
  return env as unknown as AdminRuntimeEnv;
}

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function decodeBase64Url(value: string): Uint8Array | null {
  try {
    const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const binary = atob(padded);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left[index] ^ right[index];
  }
  return mismatch === 0;
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return encodeBase64Url(new Uint8Array(signature));
}

async function verifySession(value: string): Promise<AdminUser | null> {
  const config = runtimeConfig();
  const secret = config.ADMIN_SESSION_SECRET;
  const expectedEmail = config.ADMIN_EMAIL?.trim().toLowerCase();
  if (!secret || !expectedEmail) return null;

  const separator = value.lastIndexOf(".");
  if (separator < 1) return null;
  const payloadPart = value.slice(0, separator);
  const signaturePart = value.slice(separator + 1);
  const actualSignature = decodeBase64Url(signaturePart);
  const expectedSignature = decodeBase64Url(await sign(payloadPart, secret));
  if (!actualSignature || !expectedSignature || !timingSafeEqual(actualSignature, expectedSignature)) return null;

  const payloadBytes = decodeBase64Url(payloadPart);
  if (!payloadBytes) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as SessionPayload;
    if (payload.email.toLowerCase() !== expectedEmail || payload.expiresAt <= Date.now()) return null;
    return { displayName: payload.name || payload.email, email: payload.email };
  } catch {
    return null;
  }
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;
  return session ? verifySession(session) : null;
}

export async function requireAdminUser(returnTo: string): Promise<AdminUser> {
  const user = await getAdminUser();
  if (user) return user;
  redirect(adminSignInPath(returnTo));
}

export async function verifyAdminPasswordProof(passwordProof: string): Promise<boolean> {
  const config = runtimeConfig();
  const expectedHash = config.ADMIN_PASSWORD_HASH;
  if (!passwordProof || !expectedHash || passwordProof.length > 128) return false;

  const [actualHash, configuredHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(passwordProof)),
    crypto.subtle.digest("SHA-256", encoder.encode(expectedHash)),
  ]);
  return timingSafeEqual(new Uint8Array(actualHash), new Uint8Array(configuredHash));
}

export function getAdminPasswordSalt(): string {
  return runtimeConfig().ADMIN_PASSWORD_SALT?.trim() || "";
}

export async function createAdminSessionCookie(): Promise<string | null> {
  const config = runtimeConfig();
  const secret = config.ADMIN_SESSION_SECRET;
  const email = config.ADMIN_EMAIL?.trim().toLowerCase();
  if (!secret || !email) return null;

  const payload: SessionPayload = {
    email,
    name: config.ADMIN_NAME?.trim() || email,
    expiresAt: Date.now() + SESSION_SECONDS * 1000,
  };
  const payloadPart = encodeBase64Url(encoder.encode(JSON.stringify(payload)));
  const token = `${payloadPart}.${await sign(payloadPart, secret)}`;
  return `${COOKIE_NAME}=${token}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}

export function clearAdminSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

export function adminSignInPath(returnTo = "/admin"): string {
  return `${LOGIN_PATH}?return_to=${encodeURIComponent(safeAdminReturnPath(returnTo))}`;
}

export function adminSignOutPath(returnTo = "/"): string {
  return `${LOGOUT_PATH}?return_to=${encodeURIComponent(safeReturnPath(returnTo, "/"))}`;
}

export function safeAdminReturnPath(value: string): string {
  const safe = safeReturnPath(value, "/admin");
  return safe.startsWith("/admin") && safe !== LOGIN_PATH ? safe : "/admin";
}

export function safePublicReturnPath(value: string): string {
  return safeReturnPath(value, "/");
}

function safeReturnPath(value: string, fallback: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const url = new URL(value, "https://app.local");
    if (url.origin !== "https://app.local") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
