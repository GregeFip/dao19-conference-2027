import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser, safeAdminReturnPath } from "../../admin-auth";
import "../admin.css";
import "./login.css";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; return_to?: string }>;
};

const errors: Record<string, string> = {
  invalid: "管理员密码不正确，请重新输入。",
  limited: "尝试次数过多，请一分钟后再试。",
  configuration: "后台尚未完成安全密钥配置，请联系网站维护者。",
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const returnTo = safeAdminReturnPath(params.return_to || "/admin");
  if (await getAdminUser()) redirect(returnTo);

  return (
    <main className="admin-login-shell">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <div className="admin-login-brand">
          <span aria-hidden="true">道</span>
          <div>
            <strong>DAO 19 · 2027</strong>
            <small>第十九届国际道学研讨会</small>
          </div>
        </div>
        <p className="admin-login-kicker">CONFERENCE ADMINISTRATION</p>
        <h1 id="admin-login-title">会议管理后台</h1>
        <p className="admin-login-intro">管理会议信息与素材，并查看、筛选和导出报名数据。</p>
        {params.error && errors[params.error] ? (
          <p className="admin-login-error" role="alert">{errors[params.error]}</p>
        ) : null}
        <form action="/api/admin/session" method="post">
          <input type="hidden" name="returnTo" value={returnTo} />
          <label>
            <span>管理员密码</span>
            <input
              autoComplete="current-password"
              autoFocus
              name="password"
              placeholder="请输入后台密码"
              required
              type="password"
            />
          </label>
          <button type="submit">进入后台 <b aria-hidden="true">→</b></button>
        </form>
        <Link className="admin-login-back" href="/">← 返回会议网站</Link>
      </section>
      <aside className="admin-login-aside" aria-hidden="true">
        <p>THE OVERSEAS<br />DISSEMINATION<br />OF DAOISM</p>
        <span>JINAN · SHANDONG<br />2027.08.20—24</span>
      </aside>
    </main>
  );
}
