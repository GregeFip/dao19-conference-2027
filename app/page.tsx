"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { DEFAULT_SITE_CONTENT, type SiteContent } from "./site-content";

const emptyDraft = {
  name: "",
  title: "",
  organization: "",
  email: "",
  phone: "",
  ticketType: "early",
  attendDinner: false,
  needHotel: false,
};

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [activeDay, setActiveDay] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [draft, setDraft] = useState(emptyDraft);
  const [registrationCode, setRegistrationCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/content", { cache: "no-store" })
      .then((response) => response.json())
      .then((result: { content?: SiteContent }) => {
        if (!cancelled && result.content) {
          setSiteContent(result.content);
          setActiveDay(0);
        }
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && setModalOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  const openRegistration = () => {
    setStep(1);
    setSubmitted(false);
    setDraft(emptyDraft);
    setRegistrationCode("");
    setSubmissionError("");
    setModalOpen(true);
  };

  const submitDemo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmissionError("");
    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = (await response.json()) as { registrationCode?: string; error?: string };
      if (!response.ok || !result.registrationCode) throw new Error(result.error || "提交失败，请稍后重试。");
      setRegistrationCode(result.registrationCode);
      setSubmitted(true);
      setStep(3);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "提交失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  };

  const continueRegistration = () => {
    if (!draft.name || !draft.title || !draft.organization || !draft.email) {
      setSubmissionError("请完整填写姓名、称谓、所在单位和电子邮箱。");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) {
      setSubmissionError("请输入有效的电子邮箱。");
      return;
    }
    setSubmissionError("");
    setStep(2);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const { basics, stats, about, topics, speakers, schedule, importantDates, venue, faqs } = siteContent;
  const selectedDay = schedule[activeDay] ?? schedule[0];

  return (
    <main>
      <div className="demo-bar"><span>后台功能测试版</span> 报名信息将保存至站点数据库，请勿填写不必要的敏感信息</div>

      <header className="site-header">
        <button className="brand" onClick={() => scrollTo("top")} aria-label="返回首页">
          <span className="brand-mark">N</span>
          <span><strong>{basics.shortName}</strong><small>{basics.conferenceName}</small></span>
        </button>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="打开导航" aria-expanded={menuOpen}>
          <span /><span />
        </button>
        <nav className={menuOpen ? "nav-open" : ""} aria-label="主导航">
          <button onClick={() => scrollTo("about")}>关于大会</button>
          <button onClick={() => scrollTo("speakers")}>特邀嘉宾</button>
          <button onClick={() => scrollTo("schedule")}>会议日程</button>
          <button onClick={() => scrollTo("dates")}>重要日期</button>
          <button className="nav-register" onClick={openRegistration}>立即注册 <span>↗</span></button>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <div className="eyebrow"><span /> {basics.eyebrow}</div>
          <h1>{basics.themeLine1}<br /><em>{basics.themeLine2}</em></h1>
          <p className="hero-intro">{basics.introduction}</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={openRegistration}>立即注册参会 <span>→</span></button>
            <button className="text-button" onClick={() => scrollTo("schedule")}>浏览完整日程 <span>↓</span></button>
          </div>
        </div>
        <div className="hero-visual" aria-label="会议日期及地点">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="orbital-dot dot-one" /><div className="orbital-dot dot-two" /><div className="orbital-dot dot-three" />
          <div className="hero-date"><strong>{basics.dateRange}</strong><span>{basics.monthYear}</span></div>
          <div className="hero-place"><span>CHINA</span><strong>{basics.city} · {basics.venueName}</strong></div>
        </div>
        <div className="hero-meta">
          <div><span>大会语言</span><strong>{basics.language}</strong></div>
          <div><span>早鸟注册截止</span><strong>{basics.earlyBirdDeadline}</strong></div>
          <div><span>主办单位</span><strong>{basics.organizer}</strong></div>
        </div>
      </section>

      <section className="stats" aria-label="大会规模">
        {stats.map((item, index) => <div key={`${item.label}-${index}`}><strong>{item.value}{item.suffix && <sup>{item.suffix}</sup>}</strong><span>{item.label}</span></div>)}
      </section>

      <section className="about section" id="about">
        <div className="section-label"><span>01</span> ABOUT NEXUS</div>
        <div className="about-layout">
          <div>
            <p className="kicker">{about.kicker}</p>
            <h2>{about.titleLine1}<br />{about.titleLine2}</h2>
          </div>
          <div className="about-body">
            {about.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            <button className="inline-link" onClick={() => scrollTo("topics")}>探索大会主题 <span>↘</span></button>
          </div>
        </div>
      </section>

      <section className="topics section" id="topics">
        <div className="section-label light"><span>02</span> PROGRAM TRACKS</div>
        <div className="topics-heading">
          <h2>三条主线，连接<br />智能与科学</h2>
          <p>从底层理论到真实世界影响，建立跨越学科边界的共同语言。</p>
        </div>
        <div className="topic-list">
          {topics.map(({ number, title, description }) => (
            <article className="topic-card" key={number}>
              <span className="topic-number">{number}</span>
              <div><h3>{title}</h3><p>{description}</p></div>
              <span className="topic-arrow">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="speakers section" id="speakers">
        <div className="section-label"><span>03</span> KEYNOTE SPEAKERS</div>
        <div className="section-title-row">
          <div><p className="kicker">与定义前沿的人面对面</p><h2>特邀主旨嘉宾</h2></div>
          <p>来自全球一流研究机构的科学家，将带来他们正在思考的关键问题。</p>
        </div>
        <div className="speaker-grid">
          {speakers.map((speaker) => (
            <article className="speaker-card" key={speaker.name}>
              <div className={`speaker-portrait ${speaker.tone} ${speaker.imageUrl ? "has-photo" : ""}`}>{speaker.imageUrl ? <Image className="speaker-photo" src={speaker.imageUrl} alt={`${speaker.name} 嘉宾照片`} fill sizes="(max-width: 680px) 50vw, 25vw" unoptimized /> : <><span>{speaker.initials}</span><i /></>}</div>
              <div className="speaker-info"><span>{speaker.role}</span><h3>{speaker.name}</h3><p>{speaker.organization}</p><strong>“{speaker.topic}”</strong></div>
            </article>
          ))}
        </div>
        <p className="speaker-note">更多演讲嘉宾将于 2026 年 8 月陆续公布</p>
      </section>

      <section className="schedule section" id="schedule">
        <div className="section-label light"><span>04</span> PROGRAM AT A GLANCE</div>
        <div className="schedule-head"><div><p className="kicker">三天，建立新的连接</p><h2>大会日程</h2></div><p>以下为体验版日程，正式安排可能根据嘉宾行程微调。</p></div>
        <div className="day-tabs" role="tablist" aria-label="选择会议日期">
          {schedule.map((day, index) => (
            <button key={`${day.date}-${index}`} className={activeDay === index ? "active" : ""} onClick={() => setActiveDay(index)} role="tab" aria-selected={activeDay === index}>
              <span>DAY {index + 1}</span><strong>{day.date}</strong><small>{day.weekday}</small>
            </button>
          ))}
        </div>
        <div className="schedule-table" role="tabpanel">
          {selectedDay?.items.map(({ time, title, place, host }, index) => (
            <div className="schedule-row" key={`${time}-${title}-${index}`}><time>{time}</time><h3>{title}</h3><span>{place}</span><small>{host}</small></div>
          ))}
        </div>
      </section>

      <section className="dates section" id="dates">
        <div className="section-label"><span>05</span> IMPORTANT DATES</div>
        <div className="dates-layout">
          <div><p className="kicker">把重要节点加入日历</p><h2>重要日期</h2><p className="dates-intro">现在报名可享早鸟价格。论文投稿与青年学者论坛申请将于 8 月同步开放。</p></div>
          <div className="date-list">
            {importantDates.map((item, index) => <div className={`date-item ${item.state === "future" ? "" : item.state}`} key={`${item.date}-${item.title}-${index}`}><time>{item.date}</time><span><strong>{item.title}</strong><small>{item.note}</small></span></div>)}
          </div>
        </div>
      </section>

      <section className="venue section">
        <div className="venue-card">
          <div className="venue-map" aria-hidden="true"><span className="river river-one" /><span className="river river-two" /><i className="map-pin">N</i><small>{basics.city}</small></div>
          <div className="venue-copy"><div className="section-label light"><span>06</span> VENUE</div><p className="kicker">{venue.kicker}</p><h2>{venue.name}</h2><p>{venue.address}<br />{venue.transport}</p><div className="venue-tags">{venue.tags.map((tag, index) => <span key={`${tag}-${index}`}>{tag}</span>)}</div></div>
        </div>
      </section>

      <section className="faq section">
        <div className="section-label"><span>07</span> FAQ</div>
        <div className="faq-layout">
          <div><p className="kicker">参会之前</p><h2>常见问题</h2><p>如果没有找到答案，正式版可增加会务组联系方式与在线咨询。</p></div>
          <div className="faq-list">
            {faqs.map(({ question, answer }, index) => (
              <article className={openFaq === index ? "faq-item open" : "faq-item"} key={question}>
                <button onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index}><span>{question}</span><i>{openFaq === index ? "−" : "+"}</i></button>
                <div><p>{answer}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="final-orbit" aria-hidden="true" />
        <p>{basics.shortName} · {basics.city}</p><h2>加入这场面向未来的<br /><em>学术对话</em></h2><button className="primary-button light-button" onClick={openRegistration}>立即注册参会 <span>→</span></button><small>早鸟注册截止：{basics.earlyBirdDeadline}</small>
      </section>

      <footer><div className="footer-brand"><span className="brand-mark">N</span><div><strong>{basics.shortName}</strong><small>{basics.conferenceName} · 测试版</small></div></div><div><span>主办</span><strong>{basics.organizer}</strong></div><div><span>会务咨询</span><strong>{basics.contactEmail}</strong><a className="footer-admin-link" href="/admin">报名管理 →</a><a className="footer-admin-link" href="/admin/content">内容管理 →</a></div><p>© 2026 {basics.shortName} Demo. 本站内容均为体验用途。</p></footer>

      {modalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setModalOpen(false)}>
          <section className="registration-modal" role="dialog" aria-modal="true" aria-labelledby="registration-title">
            <button className="modal-close" onClick={() => setModalOpen(false)} aria-label="关闭报名窗口">×</button>
            <div className="modal-side"><span className="brand-mark inverse">N</span><div><p>REGISTRATION</p><h2>与新的想法<br />在{basics.city}相遇</h2></div><small>{basics.monthYear} · {basics.dateRange}<br />{basics.venueName}</small></div>
            <div className="modal-main">
              <div className="demo-notice"><strong>后台测试模式</strong> 提交后信息会写入测试数据库，并可在管理后台导出。</div>
              <div className="stepper" aria-label="报名步骤"><span className={step >= 1 ? "active" : ""}><i>1</i>基本信息</span><b /><span className={step >= 2 ? "active" : ""}><i>2</i>参会选择</span><b /><span className={step >= 3 ? "active" : ""}><i>3</i>完成</span></div>
              {step === 1 && <div className="form-step"><p className="form-overline">STEP 01</p><h2 id="registration-title">参会人基本信息</h2><p>请填写以下信息，带 * 为必填项。</p><div className="field-grid"><label>姓名 *<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="请输入真实姓名" required /></label><label>称谓 *<select value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required><option value="" disabled>请选择</option><option>女士</option><option>先生</option><option>不便透露</option></select></label><label className="full">所在单位 *<input value={draft.organization} onChange={(event) => setDraft({ ...draft, organization: event.target.value })} placeholder="高校、研究机构或企业名称" required /></label><label>电子邮箱 *<input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} placeholder="name@example.com" required /></label><label>手机号码<input type="tel" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} placeholder="用于会务联系" /></label></div>{submissionError && <p className="form-error">{submissionError}</p>}<div className="form-actions"><span>预计用时 2 分钟</span><button type="button" onClick={continueRegistration}>下一步 <b>→</b></button></div></div>}
              {step === 2 && <form className="form-step" onSubmit={submitDemo}><p className="form-overline">STEP 02</p><h2>参会与票务选择</h2><p>选择最适合你的参会方式。</p><div className="ticket-options"><label><input type="radio" name="ticket" value="early" checked={draft.ticketType === "early"} onChange={(event) => setDraft({ ...draft, ticketType: event.target.value })} /><span><i>早鸟票</i><strong>¥ 1,680</strong><small>教师、科研人员及行业代表<br />含会议资料、午餐与欢迎晚宴</small></span></label><label><input type="radio" name="ticket" value="student" checked={draft.ticketType === "student"} onChange={(event) => setDraft({ ...draft, ticketType: event.target.value })} /><span><i>学生票</i><strong>¥ 880</strong><small>需在报到时出示有效学生证<br />名额有限</small></span></label></div><div className="check-row"><label><input type="checkbox" checked={draft.attendDinner} onChange={(event) => setDraft({ ...draft, attendDinner: event.target.checked })} /> 我计划参加 11 月 14 日欢迎晚宴</label><label><input type="checkbox" checked={draft.needHotel} onChange={(event) => setDraft({ ...draft, needHotel: event.target.checked })} /> 我需要会务组提供酒店协议价信息</label><label><input type="checkbox" required /> 我同意将报名信息用于本次后台测试 *</label></div>{submissionError && <p className="form-error">{submissionError}</p>}<div className="form-actions"><button type="button" className="back-button" onClick={() => setStep(1)}>← 上一步</button><button type="submit" disabled={submitting}>{submitting ? "正在保存…" : "提交测试报名"} <b>→</b></button></div></form>}
              {step === 3 && submitted && <div className="success-step"><span className="success-mark">✓</span><p className="form-overline">REGISTRATION SAVED</p><h2>报名已写入后台</h2><p>这条记录现在可以在报名管理后台中查看、筛选并导出。正式版还可继续增加确认邮件与支付状态。</p><div className="success-code"><span>报名编号</span><strong>{registrationCode}</strong></div><button onClick={() => setModalOpen(false)}>返回会议首页</button></div>}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
