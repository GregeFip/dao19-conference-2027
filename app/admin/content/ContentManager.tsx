"use client";

import Link from "next/link";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import type { SiteContent, Speaker, ScheduleDay, ImportantDate, FaqItem, Topic } from "../../site-content";

type Tab = "basics" | "sections" | "speakers" | "schedule" | "dates" | "media";
type MediaFile = { key: string; name: string; size: number; url: string; uploaded?: string };

const field = (label: string, value: string, onChange: (value: string) => void, options?: { multiline?: boolean; placeholder?: string }) => (
  <label className={options?.multiline ? "cms-field wide" : "cms-field"}><span>{label}</span>{options?.multiline ? <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={options.placeholder} /> : <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={options?.placeholder} />}</label>
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
      setStatus("saved"); setMessage("内容已保存，会议网站刷新后即可看到更新。");
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
    const file = event.target.files?.[0]; if (!file) return;
    setUploading(true); setMessage("");
    try {
      const body = new FormData(); body.append("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "上传失败");
      await loadMedia(); setMessage("图片已上传，可复制链接填入嘉宾照片字段。");
    } catch (error) { setMessage(error instanceof Error ? error.message : "上传失败，请稍后重试。"); }
    finally { setUploading(false); event.target.value = ""; }
  };

  const removeMedia = async (key: string) => {
    if (!window.confirm("确定删除这张素材吗？已在页面中使用的图片链接也会失效。")) return;
    const response = await fetch("/api/admin/media", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ key }) });
    if (response.ok) await loadMedia();
  };

  const addTopic = () => mutate((draft) => draft.topics.push({ number: String(draft.topics.length + 1).padStart(2, "0"), title: "新主题", description: "主题说明" }));
  const addSpeaker = () => mutate((draft) => draft.speakers.push({ initials: "NEW", name: "新嘉宾", role: "嘉宾职务", organization: "所在机构", topic: "报告题目", tone: "blue", imageUrl: "" }));
  const addDay = () => mutate((draft) => draft.schedule.push({ date: "新增日期", weekday: "星期", items: [] }));
  const addDate = () => mutate((draft) => draft.importantDates.push({ date: "MM.DD", title: "新日期", note: "说明", state: "future" }));
  const addFaq = () => mutate((draft) => draft.faqs.push({ question: "新问题", answer: "问题答案" }));

  return (
    <main className="admin-shell cms-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/"><span>N</span><div><strong>NEXUS 2026</strong><small>CONTENT ADMIN</small></div></Link>
        <nav><Link href="/admin"><i>01</i>报名管理</Link><Link className="active" href="/admin/content"><i>02</i>网站内容</Link><Link href="/"><i>03</i>查看会议网站</Link></nav>
        <div className="admin-account"><small>当前管理员</small><strong>{userName}</strong><a href={signOutHref}>退出登录</a></div>
      </aside>

      <section className="cms-main">
        <header className="cms-header"><div><p>CONTENT MANAGEMENT</p><h1>网站内容</h1><span>修改会议资料、嘉宾、日程与页面素材</span></div><div className="cms-actions"><Link href="/" target="_blank">预览网站 ↗</Link><button onClick={save} disabled={status === "saving"}>{status === "saving" ? "正在保存…" : "保存全部更改"}</button></div></header>
        {message && <div className={`cms-message ${status === "error" ? "error" : ""}`}>{message}</div>}
        <div className="cms-tabs" role="tablist">
          {([['basics','基本信息'],['sections','介绍与主题'],['speakers','嘉宾'],['schedule','会议日程'],['dates','日期与 FAQ'],['media','素材库']] as [Tab,string][]).map(([key, label]) => <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>{label}</button>)}
        </div>

        {tab === "basics" && <section className="cms-panel"><div className="cms-panel-head"><div><span>01</span><h2>会议基本信息</h2><p>用于页头、首页首屏、页脚和注册截止提示。</p></div></div><div className="cms-grid">
          {field("会议简称", content.basics.shortName, (value) => mutate((d) => { d.basics.shortName = value; }))}
          {field("会议全称", content.basics.conferenceName, (value) => mutate((d) => { d.basics.conferenceName = value; }))}
          {field("首页小标题", content.basics.eyebrow, (value) => mutate((d) => { d.basics.eyebrow = value; }), { multiline: true })}
          {field("主标题第一行", content.basics.themeLine1, (value) => mutate((d) => { d.basics.themeLine1 = value; }))}
          {field("主标题第二行", content.basics.themeLine2, (value) => mutate((d) => { d.basics.themeLine2 = value; }))}
          {field("首页简介", content.basics.introduction, (value) => mutate((d) => { d.basics.introduction = value; }), { multiline: true })}
          {field("日期范围", content.basics.dateRange, (value) => mutate((d) => { d.basics.dateRange = value; }), { placeholder: "14—16" })}
          {field("月份与年份", content.basics.monthYear, (value) => mutate((d) => { d.basics.monthYear = value; }), { placeholder: "NOV · 2026" })}
          {field("城市", content.basics.city, (value) => mutate((d) => { d.basics.city = value; }))}
          {field("会场名称", content.basics.venueName, (value) => mutate((d) => { d.basics.venueName = value; }))}
          {field("大会语言", content.basics.language, (value) => mutate((d) => { d.basics.language = value; }))}
          {field("早鸟截止日期", content.basics.earlyBirdDeadline, (value) => mutate((d) => { d.basics.earlyBirdDeadline = value; }))}
          {field("主办单位", content.basics.organizer, (value) => mutate((d) => { d.basics.organizer = value; }))}
          {field("联系邮箱", content.basics.contactEmail, (value) => mutate((d) => { d.basics.contactEmail = value; }))}
        </div><h3 className="cms-subtitle">首页数据指标</h3><div className="cms-repeat-grid">{content.stats.map((item, index) => <article className="cms-mini-card" key={index}>{field("数值", item.value, (value) => mutate((d) => { d.stats[index].value = value; }))}{field("后缀", item.suffix, (value) => mutate((d) => { d.stats[index].suffix = value; }))}{field("说明", item.label, (value) => mutate((d) => { d.stats[index].label = value; }))}</article>)}</div></section>}

        {tab === "sections" && <section className="cms-panel"><div className="cms-panel-head"><div><span>02</span><h2>会议介绍与主题</h2><p>管理“关于大会”、研究主题和会场信息。</p></div></div><h3 className="cms-subtitle">大会介绍</h3><div className="cms-grid">{field("引导语", content.about.kicker, (value) => mutate((d) => { d.about.kicker = value; }))}{field("标题第一行", content.about.titleLine1, (value) => mutate((d) => { d.about.titleLine1 = value; }))}{field("标题第二行", content.about.titleLine2, (value) => mutate((d) => { d.about.titleLine2 = value; }))}{content.about.paragraphs.map((paragraph,index) => <div key={index}>{field(`介绍段落 ${index+1}`, paragraph, (value) => mutate((d) => { d.about.paragraphs[index] = value; }), { multiline: true })}</div>)}</div><div className="cms-list-head"><h3 className="cms-subtitle">研究主题</h3><button onClick={addTopic}>＋ 添加主题</button></div><div className="cms-card-list">{content.topics.map((topic: Topic,index) => <article className="cms-edit-card" key={index}><button className="cms-remove" onClick={() => mutate((d) => { d.topics.splice(index,1); })}>删除</button><div className="cms-grid compact">{field("编号",topic.number,(value)=>mutate((d)=>{d.topics[index].number=value;}))}{field("主题名称",topic.title,(value)=>mutate((d)=>{d.topics[index].title=value;}))}{field("主题说明",topic.description,(value)=>mutate((d)=>{d.topics[index].description=value;}),{multiline:true})}</div></article>)}</div><h3 className="cms-subtitle">会场信息</h3><div className="cms-grid">{field("引导语",content.venue.kicker,(value)=>mutate((d)=>{d.venue.kicker=value;}))}{field("会场名称",content.venue.name,(value)=>mutate((d)=>{d.venue.name=value;}))}{field("地址",content.venue.address,(value)=>mutate((d)=>{d.venue.address=value;}),{multiline:true})}{field("交通说明",content.venue.transport,(value)=>mutate((d)=>{d.venue.transport=value;}),{multiline:true})}{field("标签（用顿号分隔）",content.venue.tags.join("、"),(value)=>mutate((d)=>{d.venue.tags=value.split("、").filter(Boolean);}))}</div></section>}

        {tab === "speakers" && <section className="cms-panel"><div className="cms-panel-head row"><div><span>03</span><h2>特邀嘉宾</h2><p>嘉宾照片可以先上传到素材库，再把图片链接粘贴到对应字段。</p></div><button onClick={addSpeaker}>＋ 添加嘉宾</button></div><div className="cms-card-list speaker-editor">{content.speakers.map((speaker: Speaker,index) => <article className="cms-edit-card" key={index}><button className="cms-remove" onClick={()=>mutate((d)=>{d.speakers.splice(index,1);})}>删除</button><div className="speaker-edit-preview">{speaker.imageUrl ? <Image src={speaker.imageUrl} alt="" fill sizes="135px" unoptimized /> : <span className={speaker.tone}>{speaker.initials}</span>}</div><div className="cms-grid compact">{field("姓名",speaker.name,(value)=>mutate((d)=>{d.speakers[index].name=value;}))}{field("姓名缩写",speaker.initials,(value)=>mutate((d)=>{d.speakers[index].initials=value;}))}{field("职务/头衔",speaker.role,(value)=>mutate((d)=>{d.speakers[index].role=value;}))}{field("所在机构",speaker.organization,(value)=>mutate((d)=>{d.speakers[index].organization=value;}))}{field("报告题目",speaker.topic,(value)=>mutate((d)=>{d.speakers[index].topic=value;}))}{field("照片链接",speaker.imageUrl,(value)=>mutate((d)=>{d.speakers[index].imageUrl=value;}),{placeholder:"从素材库复制链接"})}</div></article>)}</div></section>}

        {tab === "schedule" && <section className="cms-panel"><div className="cms-panel-head row"><div><span>04</span><h2>会议日程</h2><p>按日期管理每场活动的时间、名称、会场和主持信息。</p></div><button onClick={addDay}>＋ 添加日期</button></div><div className="cms-card-list">{content.schedule.map((day: ScheduleDay,dayIndex) => <article className="cms-edit-card schedule-editor" key={dayIndex}><button className="cms-remove" onClick={()=>mutate((d)=>{d.schedule.splice(dayIndex,1);})}>删除日期</button><div className="cms-grid compact">{field("日期",day.date,(value)=>mutate((d)=>{d.schedule[dayIndex].date=value;}))}{field("星期",day.weekday,(value)=>mutate((d)=>{d.schedule[dayIndex].weekday=value;}))}</div><div className="session-list">{day.items.map((item,itemIndex)=><div className="session-editor" key={itemIndex}>{field("时间",item.time,(value)=>mutate((d)=>{d.schedule[dayIndex].items[itemIndex].time=value;}))}{field("活动名称",item.title,(value)=>mutate((d)=>{d.schedule[dayIndex].items[itemIndex].title=value;}))}{field("会场",item.place,(value)=>mutate((d)=>{d.schedule[dayIndex].items[itemIndex].place=value;}))}{field("主持/说明",item.host,(value)=>mutate((d)=>{d.schedule[dayIndex].items[itemIndex].host=value;}))}<button onClick={()=>mutate((d)=>{d.schedule[dayIndex].items.splice(itemIndex,1);})}>×</button></div>)}</div><button className="cms-add-row" onClick={()=>mutate((d)=>{d.schedule[dayIndex].items.push({time:"09:00",title:"新增活动",place:"会场",host:"主持人"});})}>＋ 添加日程项</button></article>)}</div></section>}

        {tab === "dates" && <section className="cms-panel"><div className="cms-panel-head"><div><span>05</span><h2>重要日期与 FAQ</h2><p>管理报名节点、投稿节点和常见问题。</p></div></div><div className="cms-list-head"><h3 className="cms-subtitle">重要日期</h3><button onClick={addDate}>＋ 添加日期</button></div><div className="cms-card-list">{content.importantDates.map((item: ImportantDate,index)=><article className="cms-edit-card" key={index}><button className="cms-remove" onClick={()=>mutate((d)=>{d.importantDates.splice(index,1);})}>删除</button><div className="cms-grid compact">{field("日期",item.date,(value)=>mutate((d)=>{d.importantDates[index].date=value;}))}{field("节点名称",item.title,(value)=>mutate((d)=>{d.importantDates[index].title=value;}))}{field("补充说明",item.note,(value)=>mutate((d)=>{d.importantDates[index].note=value;}))}<label className="cms-field"><span>显示状态</span><select value={item.state} onChange={(event)=>mutate((d)=>{d.importantDates[index].state=event.target.value as ImportantDate['state'];})}><option value="passed">已完成</option><option value="current">当前重点</option><option value="future">未来节点</option></select></label></div></article>)}</div><div className="cms-list-head"><h3 className="cms-subtitle">常见问题</h3><button onClick={addFaq}>＋ 添加问题</button></div><div className="cms-card-list">{content.faqs.map((item: FaqItem,index)=><article className="cms-edit-card" key={index}><button className="cms-remove" onClick={()=>mutate((d)=>{d.faqs.splice(index,1);})}>删除</button><div className="cms-grid compact">{field("问题",item.question,(value)=>mutate((d)=>{d.faqs[index].question=value;}))}{field("回答",item.answer,(value)=>mutate((d)=>{d.faqs[index].answer=value;}),{multiline:true})}</div></article>)}</div></section>}

        {tab === "media" && <section className="cms-panel"><div className="cms-panel-head row"><div><span>06</span><h2>素材库</h2><p>支持 JPG、PNG、WebP 和 GIF，单张图片不超过 8MB。</p></div><label className="upload-button">{uploading ? "正在上传…" : "＋ 上传图片"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} disabled={uploading} /></label></div>{media.length === 0 ? <div className="media-empty">素材库还是空的，上传第一张会议图片吧。</div> : <div className="media-grid">{media.map((file)=><article key={file.key}><div className="media-thumb"><Image src={file.url} alt={file.name} fill sizes="(max-width: 680px) 45vw, 220px" unoptimized /></div><strong title={file.name}>{file.name}</strong><small>{(file.size/1024).toFixed(0)} KB</small><div><button onClick={()=>navigator.clipboard.writeText(new URL(file.url,window.location.origin).href)}>复制链接</button><button className="danger" onClick={()=>removeMedia(file.key)}>删除</button></div></article>)}</div>}</section>}
      </section>
    </main>
  );
}
