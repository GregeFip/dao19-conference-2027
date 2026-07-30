"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
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

const pageSections = [
  { id: "top", number: "00", label: "首页" },
  { id: "about", number: "01", label: "缘起" },
  { id: "theme", number: "02", label: "主题" },
  { id: "questions", number: "03", label: "议题" },
  { id: "journey", number: "04", label: "日程" },
  { id: "organizers", number: "05", label: "主办" },
  { id: "field-study", number: "06", label: "泰山" },
  { id: "venue", number: "07", label: "会场" },
  { id: "practical", number: "08", label: "行前" },
  { id: "faq", number: "09", label: "答疑" },
  { id: "final", number: "10", label: "报名" },
];

export default function Home() {
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [registrationCode, setRegistrationCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [activeSection, setActiveSection] = useState("top");
  const [scrollProgress, setScrollProgress] = useState(0);

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

  useEffect(() => {
    let frame = 0;
    const updateScrollState = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0);

      const readingLine = window.innerHeight * 0.42;
      let current = pageSections[0].id;
      pageSections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= readingLine) current = section.id;
      });
      pageSections.forEach((section) => {
        document.getElementById(section.id)?.classList.toggle("dao-chapter-active", section.id === current);
      });
      setActiveSection(current);
    };
    const requestUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateScrollState);
    };
    updateScrollState();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  useEffect(() => {
    const pageTurnMode = window.matchMedia("(min-width: 1101px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let gestureActive = false;
    let animationLocked = false;
    let gestureTimer = 0;
    let animationTimer = 0;

    const finishGestureSoon = () => {
      window.clearTimeout(gestureTimer);
      gestureTimer = window.setTimeout(() => { gestureActive = false; }, 220);
    };

    const handleChapterWheel = (event: WheelEvent) => {
      if (!pageTurnMode.matches || modalOpen || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest(".dao-modal, input, textarea, select, [contenteditable='true']")) return;
      if (Math.abs(event.deltaY) < 16) return;

      if (gestureActive || animationLocked) {
        event.preventDefault();
        finishGestureSoon();
        return;
      }

      const anchor = window.scrollY + window.innerHeight * .18;
      const currentIndex = pageSections.reduce((closestIndex, section, index) => {
        const element = document.getElementById(section.id);
        const closest = document.getElementById(pageSections[closestIndex].id);
        if (!element || !closest) return closestIndex;
        const elementTop = element.getBoundingClientRect().top + window.scrollY;
        const closestTop = closest.getBoundingClientRect().top + window.scrollY;
        return Math.abs(elementTop - anchor) < Math.abs(closestTop - anchor) ? index : closestIndex;
      }, 0);
      const nextIndex = Math.min(pageSections.length - 1, Math.max(0, currentIndex + (event.deltaY > 0 ? 1 : -1)));
      const nextSection = document.getElementById(pageSections[nextIndex].id);
      if (!nextSection || nextIndex === currentIndex) return;

      event.preventDefault();
      gestureActive = true;
      animationLocked = true;
      document.documentElement.classList.add("dao-page-turning");
      nextSection.scrollIntoView({ behavior: "smooth", block: "start" });
      finishGestureSoon();
      window.clearTimeout(animationTimer);
      animationTimer = window.setTimeout(() => {
        animationLocked = false;
        document.documentElement.classList.remove("dao-page-turning");
      }, 780);
    };

    window.addEventListener("wheel", handleChapterWheel, { passive: false });
    return () => {
      window.clearTimeout(gestureTimer);
      window.clearTimeout(animationTimer);
      document.documentElement.classList.remove("dao-page-turning");
      window.removeEventListener("wheel", handleChapterWheel);
    };
  }, [modalOpen]);

  const { basics, about, theme, topics, organizers, schedule, venue, remarks, faqs, media } = siteContent;
  const selectedDay = schedule[activeDay] ?? schedule[0];
  const activeSectionIndex = Math.max(0, pageSections.findIndex((section) => section.id === activeSection));
  const activeSectionMeta = pageSections[activeSectionIndex];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  const openRegistration = () => {
    setStep(1);
    setSubmitted(false);
    setDraft(emptyDraft);
    setRegistrationCode("");
    setSubmissionError("");
    setModalOpen(true);
  };

  const continueRegistration = () => {
    if (!draft.name || !draft.title || !draft.organization || !draft.email) {
      setSubmissionError("请完整填写姓名、称谓、所在单位和电子邮箱。 / Please complete all required fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) {
      setSubmissionError("请输入有效的电子邮箱。 / Please enter a valid email address.");
      return;
    }
    setSubmissionError("");
    setStep(2);
  };

  const submitRegistration = async (event: FormEvent<HTMLFormElement>) => {
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

  return (
    <main>
      <div className="dao-demo-bar"><span>PROTOTYPE · 測試版</span> 會議資訊依第一號公告整理，正式安排以組委會後續通知為準</div>

      <header className="dao-header">
        <button className="dao-brand" onClick={() => scrollTo("top")} aria-label="返回首页">
          <span className="dao-seal">道</span>
          <span><strong>{basics.shortName}</strong><small>{basics.chineseName}</small></span>
        </button>
        <button className="dao-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="打开导航" aria-expanded={menuOpen}><span /><span /></button>
        <nav className={menuOpen ? "open" : ""} aria-label="主导航">
          <button onClick={() => scrollTo("about")}>About <small>缘起</small></button>
          <button onClick={() => scrollTo("questions")}>Questions <small>议题</small></button>
          <button onClick={() => scrollTo("journey")}>Journey <small>日程</small></button>
          <button onClick={() => scrollTo("venue")}>Place <small>地点</small></button>
          <button className="dao-register-nav" onClick={openRegistration}>Register interest <span>↗</span></button>
        </nav>
      </header>

      <aside className="dao-page-rail" aria-label="页面章节导航">
        <div className="dao-rail-progress" aria-hidden="true">
          <span>00</span>
          <i><b style={{ height: `${scrollProgress}%` }} /></i>
          <small>10</small>
        </div>
        <nav className="dao-rail-nav" aria-label="快速跳转到页面章节">
          {pageSections.map((section) => (
            <button
              className={activeSection === section.id ? "active" : ""}
              key={section.id}
              onClick={() => scrollTo(section.id)}
              aria-label={`前往${section.label}`}
              aria-current={activeSection === section.id ? "location" : undefined}
            >
              <i aria-hidden="true" />
              <span><b>{section.number}</b>{section.label}</span>
            </button>
          ))}
        </nav>
        <div className="dao-rail-mobile-status" aria-hidden="true">
          <span>{activeSectionMeta.number}</span><strong>{activeSectionMeta.label}</strong><small>{Math.round(scrollProgress)}%</small>
        </div>
        <button className="dao-rail-top" onClick={() => scrollTo("top")} aria-label="返回页面顶部"><span>↑</span><small>{Math.round(scrollProgress)}%</small></button>
      </aside>

      <section className="dao-hero" id="top">
        <div className="dao-hero-copy">
          <p className="dao-eyebrow"><span />{basics.eyebrow}</p>
          <div className="dao-conference-lockup">
            <h1>{basics.chineseName}</h1>
            <p className="dao-conference-en">{basics.conferenceName}</p>
          </div>
          <div className="dao-hero-theme" aria-label="2027年会议主题">
            <span>2027 CONFERENCE THEME · 本屆主題</span>
            <strong>{basics.themeLine1} <em>{basics.themeLine2}</em></strong>
          </div>
          <p className="dao-hero-en">{basics.introduction}</p>
          <p className="dao-hero-zh">{basics.chineseIntroduction}</p>
          <div className="dao-actions">
            <button className="dao-primary" onClick={openRegistration}>Register interest <span>表达参会意向</span></button>
            <button className="dao-link" onClick={() => scrollTo("questions")}>Explore the theme <span>↓</span></button>
          </div>
        </div>
        <figure className="dao-hero-image">
          <Image src={media.heroImageUrl} alt="Mount Tai Heavenly Ladder / 泰山天梯" fill priority sizes="(max-width: 760px) 100vw, 48vw" unoptimized />
          <div className="dao-image-wash" />
          <figcaption><span>泰</span><p>Heavenly Ladder<br />Mount Tai · 泰山天梯</p></figcaption>
        </figure>
        <span className="dao-scroll-mark">SCROLL TO ENTER <i>↓</i></span>
      </section>

      <section className="dao-about dao-section" id="about">
        <div className="dao-section-index"><span>壹</span><small>01 · CONTEXT</small></div>
        <div className="dao-about-title">
          <p className="dao-kicker">{about.kicker}</p>
          <h2>{about.titleLine1}<br /><em>{about.titleLine2}</em></h2>
        </div>
        <div className="dao-about-copy">
          {about.paragraphs.map((paragraph, index) => <p className={index % 2 ? "zh" : ""} key={index}>{paragraph}</p>)}
        </div>
        <div className="dao-vertical-script" aria-hidden="true">道行天下<br />和而不同</div>
        <div className="dao-about-facts" aria-label="会议日期、地点和语言">
          <div><span>DATE · 日期</span><strong>{basics.monthYear}<br />{basics.dateRange}</strong></div>
          <div><span>PLACE · 地点</span><strong>{basics.city}<br />{basics.venueName}</strong></div>
          <div><span>LANGUAGE · 语言</span><strong>{basics.language}</strong></div>
        </div>
      </section>

      <section className="dao-theme" id="theme">
        <div className="dao-theme-orbit" aria-hidden="true"><i /><i /></div>
        <div className="dao-section-index light"><span>贰</span><small>02 · THEME</small></div>
        <p>CONFERENCE THEME · 會議主題</p>
        <h2>{theme.english}</h2>
        <strong>{theme.chinese}</strong>
      </section>

      <section className="dao-questions dao-section" id="questions">
        <div className="dao-section-index"><span>叁</span><small>03 · QUESTIONS</small></div>
        <div className="dao-section-heading">
          <div><p className="dao-kicker">SIX LINES OF INQUIRY · 六個討論方向</p><h2>Tracing Daoism<br />across borders</h2></div>
          <p>Six connected questions examine how Daoism travels through people, institutions, practice, and text.</p>
        </div>
        <div className="dao-question-grid">
          {topics.map((topic) => <article key={topic.number}><span>{topic.number}</span><div><h3>{topic.title}</h3><p>{topic.description}</p></div><i>↗</i></article>)}
        </div>
      </section>

      <section className="dao-journey dao-section" id="journey">
        <div className="dao-section-index light"><span>肆</span><small>04 · JOURNEY</small></div>
        <div className="dao-section-heading light-heading">
          <div><p className="dao-kicker">JULY 14—18, 2027</p><h2>Five days,<br />two sacred cities</h2></div>
          <p>Academic exchange in Jinan, followed by a field visit to Mount Tai and its Daoist temples.</p>
        </div>
        <div className="dao-day-tabs" role="tablist" aria-label="选择会议日期">
          {schedule.map((day, index) => <button key={`${day.date}-${index}`} className={activeDay === index ? "active" : ""} onClick={() => setActiveDay(index)} role="tab" aria-selected={activeDay === index}><small>0{index + 1}</small><strong>{day.date}</strong><span>{day.weekday}</span></button>)}
        </div>
        <div className="dao-schedule" role="tabpanel">
          {selectedDay?.items.map((item, index) => <article key={`${item.time}-${item.title}-${index}`}><time>{item.time}</time><h3>{item.title}</h3><span>{item.place}</span><p>{item.host}</p></article>)}
        </div>
        <div className="dao-journey-route" aria-label="济南至泰安会议行程概览">
          <div><small>BASE CITY · 會議城市</small><strong>JINAN</strong><span>濟南</span></div>
          <p><i /><em>75 KM · CONFERENCE ROUTE</em><i /></p>
          <div><small>FIELD DESTINATION · 考察地</small><strong>TAI&apos;AN</strong><span>MOUNT TAI · 泰山</span></div>
        </div>
      </section>

      <section className="dao-organizers dao-section" id="organizers">
        <div className="dao-section-index"><span>伍</span><small>05 · ORGANIZERS</small></div>
        <div className="dao-organizer-intro"><p className="dao-kicker">A GLOBAL SCHOLARLY NETWORK</p><h2>Six institutions,<br />one conversation</h2><p>本次會議由亞洲、北美多家大學與學術機構共同主辦。</p></div>
        <div className="dao-organizer-list">{organizers.map((item, index) => <article key={`${item.name}-${index}`}><span>0{index + 1}</span><h3>{item.name}</h3><p>{item.country}</p></article>)}</div>
      </section>

      <section className="dao-field-study" id="field-study" aria-label="泰山学术考察">
        <figure className="dao-canon-image"><Image src={media.canonImageUrl} alt="The Daoist Canon collected in Tai'an Museum / 泰安市博物馆藏明代道藏" fill sizes="(max-width: 760px) 100vw, 38vw" unoptimized /><figcaption>The Daoist Canon<br /><span>泰安市博物館藏明代《道藏》</span></figcaption></figure>
        <div className="dao-field-copy"><div className="dao-section-index light"><span>陆</span><small>06 · FIELD STUDY</small></div><p className="dao-kicker">MOUNT TAI · 泰山</p><h2>Reading tradition<br />in the landscape</h2><p>The conference extends from the seminar room into the sacred landscape of Mount Tai—visiting temples, collections, and places where Daoist history remains tangible.</p><p className="zh">會後考察將學術討論延伸至泰山的宮觀、文物與宗教景觀，在行走與觀看之間理解傳統。</p><div className="dao-distance"><strong>75</strong><span>KM<br />JINAN → TAI&apos;AN</span></div></div>
      </section>

      <section className="dao-venue dao-section" id="venue">
        <div className="dao-section-index"><span>柒</span><small>07 · PLACE</small></div>
        <div className="dao-venue-card">
          <div className="dao-venue-copy"><p className="dao-kicker">{venue.kicker}</p><h2>{venue.name}</h2><p>{venue.address}</p><p className="zh">{venue.transport}</p><div>{venue.tags.map((tag, index) => <span key={`${tag}-${index}`}>{tag}</span>)}</div></div>
          <figure><Image src={media.campusMapUrl} alt="Shandong University Central Campus map" fill sizes="(max-width: 760px) 100vw, 50vw" unoptimized /><figcaption>Campus guide · 校園導覽圖</figcaption></figure>
        </div>
      </section>

      <section className="dao-practical dao-section" id="practical">
        <div className="dao-section-index"><span>捌</span><small>08 · PRACTICAL</small></div>
        <div className="dao-section-heading"><div><p className="dao-kicker">BEFORE YOU ARRIVE · 行前資訊</p><h2>Practical notes</h2></div><p>Details are drawn from Announcement No. 1 and may be refined by the organizing committee.</p></div>
        <div className="dao-remark-grid">{remarks.map((item, index) => <article key={`${item.title}-${index}`}><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
      </section>

      <section className="dao-faq dao-section" id="faq">
        <div><p className="dao-kicker">QUESTIONS · 常見問題</p><h2>Before the journey</h2><p>Useful answers for participants preparing to come to Jinan.</p></div>
        <div className="dao-faq-list">{faqs.map((item, index) => <article className={openFaq === index ? "open" : ""} key={`${item.question}-${index}`}><button onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index}><span>{item.question}</span><i>{openFaq === index ? "−" : "+"}</i></button><div><p>{item.answer}</p></div></article>)}</div>
      </section>

      <section className="dao-final" id="final">
        <span className="dao-final-seal">道</span><p>{basics.monthYear} · {basics.city}</p><h2>Join the conversation.<br /><em>Walk the mountain.</em></h2><strong>參與對話 · 共赴泰山</strong><button className="dao-primary inverse" onClick={openRegistration}>Register interest <span>表达参会意向</span></button><small>Announcement issued {basics.announcementDate}</small>
      </section>

      <footer className="dao-footer"><div className="dao-footer-brand"><span className="dao-seal">道</span><div><strong>{basics.conferenceName}</strong><small>{basics.chineseName}</small></div></div><div><span>VENUE · 地點</span><strong>{basics.venueName}</strong><small>{basics.city}</small></div><div><span>ADMINISTRATION · 管理</span><a href="/admin">Registration records →</a><a href="/admin/content">Website content →</a></div><p>© 2027 DAO 19 · Prototype based on Announcement No. 1</p></footer>

      {modalOpen && <div className="dao-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setModalOpen(false)}>
        <section className="dao-modal" role="dialog" aria-modal="true" aria-labelledby="registration-title">
          <button className="dao-modal-close" onClick={() => setModalOpen(false)} aria-label="关闭报名窗口">×</button>
          <aside><span className="dao-seal">道</span><div><p>REGISTER INTEREST</p><h2>Begin the<br />journey</h2><strong>參會意向登記</strong></div><small>{basics.monthYear} · {basics.dateRange}<br />{basics.venueName}</small></aside>
          <div className="dao-form-main">
            <div className="dao-form-notice"><strong>PROTOTYPE</strong> This form records conference interest only. Please do not enter passport details. 本表單僅用於測試及參會意向登記，請勿填寫護照資料。</div>
            <div className="dao-stepper"><span className={step >= 1 ? "active" : ""}><i>1</i>PROFILE</span><b /><span className={step >= 2 ? "active" : ""}><i>2</i>PLANS</span><b /><span className={step >= 3 ? "active" : ""}><i>3</i>DONE</span></div>
            {step === 1 && <div className="dao-form-step"><p className="dao-form-overline">STEP 01 · 基本資料</p><h2 id="registration-title">Tell us about yourself</h2><p>Required fields are marked with an asterisk.</p><div className="dao-field-grid"><label>Name / 姓名 *<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></label><label>Title / 稱謂 *<select value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required><option value="" disabled>Select / 請選擇</option><option>Professor / 教授</option><option>Dr. / 博士</option><option>Mr. / 先生</option><option>Ms. / 女士</option><option>Other / 其他</option></select></label><label className="full">Institution / 所在單位 *<input value={draft.organization} onChange={(event) => setDraft({ ...draft, organization: event.target.value })} required /></label><label>Email / 電子郵箱 *<input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} required /></label><label>Phone / 電話<input type="tel" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></label></div>{submissionError && <p className="dao-form-error">{submissionError}</p>}<div className="dao-form-actions"><span>約 2 分鐘</span><button onClick={continueRegistration}>Continue <b>→</b></button></div></div>}
            {step === 2 && <form className="dao-form-step" onSubmit={submitRegistration}><p className="dao-form-overline">STEP 02 · 參會計劃</p><h2>Your conference plans</h2><p>No conference fee is collected in this prototype.</p><div className="dao-role-options"><label><input type="radio" name="role" value="early" checked={draft.ticketType === "early"} onChange={(event) => setDraft({ ...draft, ticketType: event.target.value })} /><span><i>RESEARCHER</i><strong>Scholar / 學者</strong><small>Faculty, researchers and independent scholars</small></span></label><label><input type="radio" name="role" value="student" checked={draft.ticketType === "student"} onChange={(event) => setDraft({ ...draft, ticketType: event.target.value })} /><span><i>STUDENT</i><strong>Student / 學生</strong><small>Graduate and undergraduate participants</small></span></label></div><div className="dao-checks"><label><input type="checkbox" checked={draft.attendDinner} onChange={(event) => setDraft({ ...draft, attendDinner: event.target.checked })} /> I&apos;m interested in the Mount Tai field study / 擬參加泰山考察</label><label><input type="checkbox" checked={draft.needHotel} onChange={(event) => setDraft({ ...draft, needHotel: event.target.checked })} /> I need accommodation assistance / 需要住宿協助</label><label><input type="checkbox" required /> I agree to submit this information for the prototype / 同意提交測試資料 *</label></div>{submissionError && <p className="dao-form-error">{submissionError}</p>}<div className="dao-form-actions"><button type="button" className="back" onClick={() => setStep(1)}>← Back</button><button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Submit interest"} <b>→</b></button></div></form>}
            {step === 3 && submitted && <div className="dao-success"><span>✓</span><p className="dao-form-overline">INTEREST RECORDED</p><h2>Thank you.</h2><p>Your record is now available in the protected registration administration system. This is not a final admission confirmation.</p><div><small>REFERENCE</small><strong>{registrationCode}</strong></div><button onClick={() => setModalOpen(false)}>Return to the conference site</button></div>}
          </div>
        </section>
      </div>}
    </main>
  );
}
