"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import type { FaqItem, Organizer, Remark, ScheduleDay, SiteContent, Topic } from "../../site-content";

type Tab = "basics" | "story" | "subjects" | "journey" | "practical" | "media";
type MediaFile = { key: string; name: string; size: number; url: string; uploaded?: string };

const field = (label: string, value: string, onChange: (value: string) => void, options?: { multiline?: boolean; placeholder?: string }) => (
  <label className={options?.multiline ? "cms-field wide" : "cms-field"}>
    <span>{label}</span>
    {options?.multiline
      ? <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={options.placeholder} />
      : <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={options?.placeholder} />}
  </label>
);

export default function ContentManager({ initialContent, userName, signOutHref }: { initialContent: SiteContent; userName: string; signOutHref: string }) {
  const [content, setContent] = useState(initialContent);
  const [tab, setTab] = useState<Tab>("basics");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const mutate = (change: (draft: SiteContent) => void) => {
    setContent((current) => { const next = structuredClone(current); change(next); return next; });
    setStatus("idle");
  };

  const save = async () => {
    setStatus("saving"); setMessage("");
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ content }) });
      const result = (await response.json()) as { saved?: boolean; error?: string };
      if (!response.ok) throw new Error(result.error || "保存失败");
      setStatus("saved"); setMessage("内容已保存，刷新会议网站即可看到更新。");
    } catch (error) { setStatus("error"); setMessage(error instanceof Error ? error.message : "保存失败，请稍后重试。"); }
  };

  const loadMedia = async () => {
    const response = await fetch("/api/admin/media", { cache: "no-store" });
    if (response.ok) setMedia(((await response.json()) as { files: MediaFile[] }).files);
  };

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/media", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : { files: [] })
      .then((result: { files: MediaFile[] }) => { if (!cancelled) setMedia(result.files); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true); setMessage("");
    try {
      const body = new FormData(); body.append("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "上传失败");
      await loadMedia(); setMessage("图片已上传，可复制链接填入页面图片字段。");
    } catch (error) { setStatus("error"); setMessage(error instanceof Error ? error.message : "上传失败，请稍后重试。"); }
    finally { setUploading(false); event.target.value = ""; }
  };

  const removeMedia = async (key: string) => {
    if (!window.confirm("确定删除这张素材吗？已使用的图片链接也会失效。")) return;
    const response = await fetch("/api/admin/media", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ key }) });
    if (response.ok) await loadMedia();
  };

  const addTopic = () => mutate((draft) => draft.topics.push({ number: String(draft.topics.length + 1).padStart(2, "0"), title: "New subject", description: "議題說明" }));
  const addOrganizer = () => mutate((draft) => draft.organizers.push({ name: "New institution", country: "Country · 國家" }));
  const addDay = () => mutate((draft) => draft.schedule.push({ date: "NEW DATE", weekday: "日程說明", items: [] }));
  const addRemark = () => mutate((draft) => draft.remarks.push({ title: "New note · 新資訊", body: "Practical information / 行前說明" }));
  const addFaq = () => mutate((draft) => draft.faqs.push({ question: "New question / 新問題", answer: "Answer / 回答" }));

  return (
    <main className="admin-shell cms-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/"><span>道</span><div><strong>DAO 19 · 2027</strong><small>CONTENT ADMIN</small></div></Link>
        <nav><Link href="/admin"><i>01</i>报名管理</Link><Link className="active" href="/admin/content"><i>02</i>网站内容</Link><Link href="/"><i>03</i>查看会议网站</Link></nav>
        <div className="admin-account"><small>当前管理员</small><strong>{userName}</strong><a href={signOutHref}>退出登录</a></div>
      </aside>

      <section className="cms-main">
        <header className="cms-header"><div><p>DAO 19 · CONTENT MANAGEMENT</p><h1>网站内容</h1><span>管理双语会议资料、议题、日程、行前信息与页面素材</span></div><div className="cms-actions"><Link href="/" target="_blank">预览网站 ↗</Link><button onClick={save} disabled={status === "saving"}>{status === "saving" ? "正在保存…" : "保存全部更改"}</button></div></header>
        {message && <div className={`cms-message ${status === "error" ? "error" : ""}`}>{message}</div>}
        <div className="cms-tabs" role="tablist">
          {([['basics','基本信息'],['story','大会介绍'],['subjects','议题与主办方'],['journey','会议日程'],['practical','行前信息'],['media','素材库']] as [Tab,string][]).map(([key, label]) => <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>{label}</button>)}
        </div>

        {tab === "basics" && <section className="cms-panel"><div className="cms-panel-head"><div><span>01</span><h2>会议基本信息</h2><p>用于页头、首屏、日期地点与页脚。</p></div></div><div className="cms-grid">
          {field("会议简称", content.basics.shortName, (value) => mutate((d) => { d.basics.shortName = value; }))}
          {field("英文全称", content.basics.conferenceName, (value) => mutate((d) => { d.basics.conferenceName = value; }))}
          {field("中文全称", content.basics.chineseName, (value) => mutate((d) => { d.basics.chineseName = value; }))}
          {field("公告眉题", content.basics.eyebrow, (value) => mutate((d) => { d.basics.eyebrow = value; }))}
          {field("英文简介", content.basics.introduction, (value) => mutate((d) => { d.basics.introduction = value; }), { multiline: true })}
          {field("中文简介", content.basics.chineseIntroduction, (value) => mutate((d) => { d.basics.chineseIntroduction = value; }), { multiline: true })}
          {field("日期范围", content.basics.dateRange, (value) => mutate((d) => { d.basics.dateRange = value; }))}
          {field("月份与年份", content.basics.monthYear, (value) => mutate((d) => { d.basics.monthYear = value; }))}
          {field("城市", content.basics.city, (value) => mutate((d) => { d.basics.city = value; }))}
          {field("会场名称", content.basics.venueName, (value) => mutate((d) => { d.basics.venueName = value; }))}
          {field("会议语言", content.basics.language, (value) => mutate((d) => { d.basics.language = value; }))}
          {field("公告日期", content.basics.announcementDate, (value) => mutate((d) => { d.basics.announcementDate = value; }))}
          {field("组委会名称", content.basics.organizer, (value) => mutate((d) => { d.basics.organizer = value; }))}
          {field("联系邮箱（可留空）", content.basics.contactEmail, (value) => mutate((d) => { d.basics.contactEmail = value; }))}
        </div><h3 className="cms-subtitle">首页数据指标</h3><div className="cms-repeat-grid">{content.stats.map((item, index) => <article className="cms-mini-card" key={index}>{field("数值", item.value, (value) => mutate((d) => { d.stats[index].value = value; }))}{field("后缀", item.suffix, (value) => mutate((d) => { d.stats[index].suffix = value; }))}{field("说明", item.label, (value) => mutate((d) => { d.stats[index].label = value; }))}</article>)}</div></section>}

        {tab === "story" && <section className="cms-panel"><div className="cms-panel-head"><div><span>02</span><h2>大会介绍与主题</h2><p>管理缘起文字和官方双语主题。</p></div></div><div className="cms-grid">{field("介绍引导语", content.about.kicker, (value) => mutate((d) => { d.about.kicker = value; }))}{field("介绍标题第一行", content.about.titleLine1, (value) => mutate((d) => { d.about.titleLine1 = value; }))}{field("介绍标题第二行", content.about.titleLine2, (value) => mutate((d) => { d.about.titleLine2 = value; }))}{content.about.paragraphs.map((paragraph, index) => <div key={index}>{field(`介绍段落 ${index + 1}`, paragraph, (value) => mutate((d) => { d.about.paragraphs[index] = value; }), { multiline: true })}</div>)}{field("英文会议主题", content.theme.english, (value) => mutate((d) => { d.theme.english = value; }), { multiline: true })}{field("中文会议主题", content.theme.chinese, (value) => mutate((d) => { d.theme.chinese = value; }), { multiline: true })}</div></section>}

        {tab === "subjects" && <section className="cms-panel"><div className="cms-panel-head"><div><span>03</span><h2>研讨议题与主办机构</h2><p>可增加、删除并调整六项研讨方向和机构名单。</p></div></div><div className="cms-list-head"><h3 className="cms-subtitle">研讨议题</h3><button onClick={addTopic}>＋ 添加议题</button></div><div className="cms-card-list">{content.topics.map((topic: Topic, index) => <article className="cms-edit-card" key={index}><button className="cms-remove" onClick={() => mutate((d) => { d.topics.splice(index, 1); })}>删除</button><div className="cms-grid compact">{field("编号", topic.number, (value) => mutate((d) => { d.topics[index].number = value; }))}{field("英文标题", topic.title, (value) => mutate((d) => { d.topics[index].title = value; }))}{field("中文说明", topic.description, (value) => mutate((d) => { d.topics[index].description = value; }), { multiline: true })}</div></article>)}</div><div className="cms-list-head"><h3 className="cms-subtitle">主办机构</h3><button onClick={addOrganizer}>＋ 添加机构</button></div><div className="cms-card-list">{content.organizers.map((item: Organizer, index) => <article className="cms-edit-card" key={index}><button className="cms-remove" onClick={() => mutate((d) => { d.organizers.splice(index, 1); })}>删除</button><div className="cms-grid compact">{field("机构名称", item.name, (value) => mutate((d) => { d.organizers[index].name = value; }))}{field("国家或地区", item.country, (value) => mutate((d) => { d.organizers[index].country = value; }))}</div></article>)}</div></section>}

        {tab === "journey" && <section className="cms-panel"><div className="cms-panel-head row"><div><span>04</span><h2>会议日程</h2><p>管理抵达、会议、泰山考察与离会安排。</p></div><button onClick={addDay}>＋ 添加日期</button></div><div className="cms-card-list">{content.schedule.map((day: ScheduleDay, dayIndex) => <article className="cms-edit-card schedule-editor" key={dayIndex}><button className="cms-remove" onClick={() => mutate((d) => { d.schedule.splice(dayIndex, 1); })}>删除日期</button><div className="cms-grid compact">{field("日期", day.date, (value) => mutate((d) => { d.schedule[dayIndex].date = value; }))}{field("双语说明", day.weekday, (value) => mutate((d) => { d.schedule[dayIndex].weekday = value; }))}</div><div className="session-list">{day.items.map((item, itemIndex) => <div className="session-editor" key={itemIndex}>{field("时间", item.time, (value) => mutate((d) => { d.schedule[dayIndex].items[itemIndex].time = value; }))}{field("活动名称", item.title, (value) => mutate((d) => { d.schedule[dayIndex].items[itemIndex].title = value; }))}{field("地点", item.place, (value) => mutate((d) => { d.schedule[dayIndex].items[itemIndex].place = value; }))}{field("补充说明", item.host, (value) => mutate((d) => { d.schedule[dayIndex].items[itemIndex].host = value; }))}<button onClick={() => mutate((d) => { d.schedule[dayIndex].items.splice(itemIndex, 1); })}>×</button></div>)}</div><button className="cms-add-row" onClick={() => mutate((d) => { d.schedule[dayIndex].items.push({ time: "09:00", title: "New session", place: "Venue", host: "Details" }); })}>＋ 添加日程项</button></article>)}</div></section>}

        {tab === "practical" && <section className="cms-panel"><div className="cms-panel-head"><div><span>05</span><h2>地点、行前信息与 FAQ</h2><p>管理会场、住宿、餐饮、泰山考察及常见问题。</p></div></div><h3 className="cms-subtitle">会场信息</h3><div className="cms-grid">{field("引导语", content.venue.kicker, (value) => mutate((d) => { d.venue.kicker = value; }))}{field("会场名称", content.venue.name, (value) => mutate((d) => { d.venue.name = value; }))}{field("英文地址", content.venue.address, (value) => mutate((d) => { d.venue.address = value; }), { multiline: true })}{field("中文交通说明", content.venue.transport, (value) => mutate((d) => { d.venue.transport = value; }), { multiline: true })}{field("标签（用顿号分隔）", content.venue.tags.join("、"), (value) => mutate((d) => { d.venue.tags = value.split("、").filter(Boolean); }))}</div><div className="cms-list-head"><h3 className="cms-subtitle">行前信息</h3><button onClick={addRemark}>＋ 添加信息</button></div><div className="cms-card-list">{content.remarks.map((item: Remark, index) => <article className="cms-edit-card" key={index}><button className="cms-remove" onClick={() => mutate((d) => { d.remarks.splice(index, 1); })}>删除</button><div className="cms-grid compact">{field("标题", item.title, (value) => mutate((d) => { d.remarks[index].title = value; }))}{field("双语内容", item.body, (value) => mutate((d) => { d.remarks[index].body = value; }), { multiline: true })}</div></article>)}</div><div className="cms-list-head"><h3 className="cms-subtitle">常见问题</h3><button onClick={addFaq}>＋ 添加问题</button></div><div className="cms-card-list">{content.faqs.map((item: FaqItem, index) => <article className="cms-edit-card" key={index}><button className="cms-remove" onClick={() => mutate((d) => { d.faqs.splice(index, 1); })}>删除</button><div className="cms-grid compact">{field("问题", item.question, (value) => mutate((d) => { d.faqs[index].question = value; }))}{field("回答", item.answer, (value) => mutate((d) => { d.faqs[index].answer = value; }), { multiline: true })}</div></article>)}</div></section>}

        {tab === "media" && <section className="cms-panel"><div className="cms-panel-head row"><div><span>06</span><h2>页面图片与素材库</h2><p>上传素材后复制链接，并填入对应页面图片字段。</p></div><label className="upload-button">{uploading ? "正在上传…" : "＋ 上传图片"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} disabled={uploading} /></label></div><div className="cms-grid">{field("首屏泰山图片", content.media.heroImageUrl, (value) => mutate((d) => { d.media.heroImageUrl = value; }))}{field("《道藏》图片", content.media.canonImageUrl, (value) => mutate((d) => { d.media.canonImageUrl = value; }))}{field("校园导览图", content.media.campusMapUrl, (value) => mutate((d) => { d.media.campusMapUrl = value; }))}{field("济南—泰山路线图", content.media.routeMapUrl, (value) => mutate((d) => { d.media.routeMapUrl = value; }))}</div><h3 className="cms-subtitle">已上传素材</h3>{media.length === 0 ? <div className="media-empty">素材库暂无上传图片。</div> : <div className="media-grid">{media.map((file) => <article key={file.key}><div className="media-thumb"><Image src={file.url} alt={file.name} fill sizes="(max-width: 680px) 45vw, 220px" unoptimized /></div><strong title={file.name}>{file.name}</strong><small>{(file.size / 1024).toFixed(0)} KB</small><div><button onClick={() => navigator.clipboard.writeText(new URL(file.url, window.location.origin).href)}>复制链接</button><button className="danger" onClick={() => removeMedia(file.key)}>删除</button></div></article>)}</div>}</section>}
      </section>
    </main>
  );
}
