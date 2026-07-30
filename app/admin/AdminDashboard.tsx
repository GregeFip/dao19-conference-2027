"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Registration = {
  id: number;
  registrationCode: string;
  name: string;
  title: string;
  organization: string;
  email: string;
  phone: string;
  ticketType: string;
  attendDinner: boolean;
  needHotel: boolean;
  status: string;
  createdAt: string;
};

export default function AdminDashboard({ registrations, userName, signOutHref }: { registrations: Registration[]; userName: string; signOutHref: string }) {
  const [query, setQuery] = useState("");
  const [ticket, setTicket] = useState("all");
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return registrations.filter((row) => {
      const matchesTicket = ticket === "all" || row.ticketType === ticket;
      const matchesQuery = !keyword || [row.registrationCode, row.name, row.organization, row.email, row.phone].some((value) => value.toLowerCase().includes(keyword));
      return matchesTicket && matchesQuery;
    });
  }, [query, registrations, ticket]);

  const students = registrations.filter((row) => row.ticketType === "student").length;
  const dinners = registrations.filter((row) => row.attendDinner).length;
  const hotels = registrations.filter((row) => row.needHotel).length;

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/"><span>N</span><div><strong>NEXUS 2026</strong><small>REGISTRATION ADMIN</small></div></Link>
        <nav><Link className="active" href="/admin"><i>01</i>报名管理</Link><Link href="/admin/content"><i>02</i>网站内容</Link><Link href="/"><i>03</i>查看会议网站</Link></nav>
        <div className="admin-account"><small>当前管理员</small><strong>{userName}</strong><a href={signOutHref}>退出登录</a></div>
      </aside>

      <section className="admin-main">
        <header className="admin-header"><div><p>REGISTRATION CENTER</p><h1>报名管理</h1><span>集中查看、筛选和导出参会人信息</span></div><a className="export-button" href="/api/admin/registrations/export">导出完整名单 <b>↓</b></a></header>

        <div className="admin-stats">
          <article><span>报名总数</span><strong>{registrations.length}</strong><small>人</small></article>
          <article><span>学生参会</span><strong>{students}</strong><small>人</small></article>
          <article><span>参加晚宴</span><strong>{dinners}</strong><small>人</small></article>
          <article><span>需要酒店信息</span><strong>{hotels}</strong><small>人</small></article>
        </div>

        <section className="admin-panel">
          <div className="admin-toolbar"><label><span>搜索报名信息</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="姓名、单位、邮箱或报名编号" /></label><label><span>票种筛选</span><select value={ticket} onChange={(event) => setTicket(event.target.value)}><option value="all">全部票种</option><option value="early">早鸟票</option><option value="student">学生票</option></select></label><p>显示 {filtered.length} / {registrations.length} 条</p></div>

          {registrations.length === 0 ? (
            <div className="admin-empty"><span>∅</span><h2>还没有报名记录</h2><p>返回会议网站提交一次测试报名，记录会立即出现在这里。</p><Link href="/">前往会议网站</Link></div>
          ) : (
            <div className="admin-table-wrap"><table><thead><tr><th>参会人</th><th>单位与联系方式</th><th>票种</th><th>服务需求</th><th>报名时间</th><th>状态</th></tr></thead><tbody>{filtered.map((row) => <tr key={row.id}><td><strong>{row.name}</strong><small>{row.title} · {row.registrationCode}</small></td><td><strong>{row.organization}</strong><small>{row.email}{row.phone ? ` · ${row.phone}` : ""}</small></td><td><span className={`ticket-tag ${row.ticketType}`}>{row.ticketType === "student" ? "学生票" : "早鸟票"}</span></td><td><span className="service-list">{row.attendDinner ? "晚宴" : "—"}{row.needHotel ? " · 酒店" : ""}</span></td><td><time>{new Date(`${row.createdAt.replace(" ", "T")}Z`).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</time></td><td><span className="status-dot" />已确认</td></tr>)}</tbody></table>{filtered.length === 0 && <div className="no-results">没有符合筛选条件的记录</div>}</div>
          )}
        </section>
      </section>
    </main>
  );
}
