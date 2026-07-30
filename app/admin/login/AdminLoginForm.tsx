"use client";

import { useState, type FormEvent } from "react";

const encoder = new TextEncoder();

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

async function derivePasswordProof(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: encoder.encode(salt), iterations: 210_000 },
    key,
    256,
  );
  return encodeBase64Url(new Uint8Array(derived));
}

export default function AdminLoginForm({ passwordSalt, returnTo }: { passwordSalt: string; returnTo: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [clientError, setClientError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const passwordInput = form.elements.namedItem("password") as HTMLInputElement | null;
    const proofInput = form.elements.namedItem("passwordProof") as HTMLInputElement | null;
    if (!passwordInput?.value || !proofInput) return;
    if (!passwordSalt) {
      setClientError("后台尚未完成安全密钥配置，请联系网站维护者。");
      return;
    }

    setSubmitting(true);
    setClientError("");
    try {
      proofInput.value = await derivePasswordProof(passwordInput.value, passwordSalt);
      passwordInput.disabled = true;
      form.submit();
    } catch {
      setSubmitting(false);
      setClientError("当前浏览器无法完成安全验证，请升级浏览器后重试。");
    }
  }

  return (
    <form action="/api/admin/session" method="post" onSubmit={handleSubmit}>
      <input name="returnTo" type="hidden" value={returnTo} />
      <input name="passwordProof" type="hidden" />
      <label>
        <span>管理员密码</span>
        <input
          autoComplete="current-password"
          autoFocus
          disabled={submitting}
          name="password"
          placeholder="请输入后台密码"
          required
          type="password"
        />
      </label>
      {clientError ? <p className="admin-login-error" role="alert">{clientError}</p> : null}
      <button disabled={submitting} type="submit">
        {submitting ? "正在安全验证…" : <>进入后台 <b aria-hidden="true">→</b></>}
      </button>
    </form>
  );
}
