"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_SITE_CONTENT, type SiteContent } from "./site-content";
import { splitBilingualText } from "./bilingual-text";

function InlinePhrases({ text }: { text: string }) {
  return <>{text.split(/(\d{1,2}:\d{2}\s*[–—-]\s*\d{1,2}:\d{2}|US\s*\$\s*\d+)/).map((part, index) => index % 2
    ? <bdi className="dao-nowrap" key={index}>{part}</bdi>
    : part)}</>;
}

function BilingualText({ text }: { text: string }) {
  const lines = splitBilingualText(text);
  if (lines.length === 1) return <InlinePhrases text={text} />;
  return <bdi className="dao-bilingual">{lines.map((line, index) => <bdi className="dao-language-line" lang={index === 0 ? "en" : "zh-Hant"} key={`${index}-${line}`}><InlinePhrases text={line} /></bdi>)}</bdi>;
}

const MICROSOFT_FORM_URL = "https://forms.cloud.microsoft/r/7c8DrdS0dw";
const PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const publicAsset = (path: string) => path.startsWith("/") ? `${PUBLIC_BASE_PATH}${path}` : path;

const pageSections = [
  { id: "top", number: "00", label: "首页" },
  { id: "about", number: "01", label: "缘起" },
  { id: "theme", number: "02", label: "主题" },
  { id: "questions", number: "03", label: "议题" },
  { id: "format", number: "04", label: "形式" },
  { id: "journey", number: "05", label: "日程" },
  { id: "organizers", number: "06", label: "主办" },
  { id: "field-study", number: "07", label: "考察" },
  { id: "venue", number: "08", label: "会场" },
  { id: "fees", number: "09", label: "费用" },
  { id: "practical", number: "10", label: "行前" },
  { id: "faq", number: "11", label: "答疑" },
  { id: "final", number: "12", label: "注册" },
];

export default function Home() {
  const pageRef = useRef<HTMLElement>(null);
  const siteContent: SiteContent = DEFAULT_SITE_CONTENT;
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [organizerTab, setOrganizerTab] = useState(0);
  const [activeSection, setActiveSection] = useState("top");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [desktopHeader, setDesktopHeader] = useState({ condensed: false, visible: true });

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const desktop = window.matchMedia("(min-width: 1101px) and (min-height: 650px)");
    const announcement = page.querySelector<HTMLElement>(".dao-announcement-bar");
    const header = page.querySelector<HTMLElement>(".dao-header-slot");
    let frame = 0;
    const fitViewport = () => {
      const enabled = desktop.matches && CSS.supports("zoom", "1");
      page.classList.toggle("dao-viewport-fit", enabled);
      if (!enabled) return;
      const height = document.documentElement.clientHeight;
      const chrome = (announcement?.offsetHeight ?? 0) + (header?.offsetHeight ?? 0);
      const chapterScale = Math.min(1, height / 800);
      const heroHeight = Math.max(1, height - chrome);
      page.style.setProperty("--dao-chapter-scale", String(chapterScale));
      page.style.setProperty("--dao-page-height", `${height / chapterScale}px`);
      page.style.setProperty("--dao-hero-scale", String(Math.min(1, heroHeight / 800)));
      page.style.setProperty("--dao-hero-height", `${Math.max(800, heroHeight)}px`);
      page.style.setProperty("--dao-home-chrome", `${chrome}px`);
    };
    const requestFit = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(fitViewport);
    };
    const observer = new ResizeObserver(requestFit);
    if (announcement) observer.observe(announcement);
    if (header) observer.observe(header);
    fitViewport();
    window.addEventListener("resize", requestFit);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", requestFit);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    let lastScrollY = window.scrollY;
    let wasCondensed = false;
    let headerVisible = true;
    const updateScrollState = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0);

      const hero = document.getElementById("top");
      const condensed = window.innerWidth > 820 && Boolean(hero && hero.getBoundingClientRect().bottom <= 0);
      const scrollDelta = window.scrollY - lastScrollY;
      if (!condensed || !wasCondensed) headerVisible = true;
      else if (scrollDelta > 8) headerVisible = false;
      else if (scrollDelta < -8) headerVisible = true;
      setDesktopHeader((current) => current.condensed === condensed && current.visible === headerVisible
        ? current
        : { condensed, visible: headerVisible });
      lastScrollY = window.scrollY;
      wasCondensed = condensed;

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
      if (!pageTurnMode.matches || !pageRef.current?.classList.contains("dao-viewport-fit") || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
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
  }, []);

  const { basics, about, theme, topics, organizers, academicGuests, standingCommittee, formats, schedule, importantDates, venue, fees, feeNotes, remarks, faqs, registration, media } = siteContent;
  const registrationEmail = `mailto:${basics.contactEmail}?subject=${encodeURIComponent(registration.subject)}`;
  const organizerGroups = [
    { label: "Chairs & keynotes · 主席與演講", items: academicGuests },
    { label: "Organizers · 主辦與協辦", items: organizers },
    { label: "Committee · 常設委員會", items: standingCommittee },
  ];
  const selectedDay = schedule[activeDay] ?? schedule[0];
  const activeSectionIndex = Math.max(0, pageSections.findIndex((section) => section.id === activeSection));
  const activeSectionMeta = pageSections[activeSectionIndex];
  const conferenceOpening = basics.conferenceName.split(" ").slice(0, 2).join(" ");
  const chineseThemeLines = theme.chinese.split(/(?<=：)/);

  const scrollTo = (id: string) => {
    if (id === "top") window.scrollTo({ top: 0, behavior: "smooth" });
    else document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  return (
    <main ref={pageRef}>
      <div className="dao-announcement-bar"><span>DAO 19 · 2027</span> MAY 25—29 · 濟南五峰山 <a href="#final"><BilingualText text="Registration & abstracts by March 1 · 3月1日截止" /></a></div>

      <div className="dao-header-slot"><header className={`dao-header${desktopHeader.condensed ? " dao-header-condensed" : ""}${desktopHeader.visible ? "" : " dao-header-hidden"}`}>
        <button className="dao-brand" onClick={() => scrollTo("top")} aria-label="返回首页">
          <span className="dao-seal" aria-hidden="true"><Image src={publicAsset("/dao/wurui-lishu-dao.png")} alt="" width={190} height={190} /></span>
          <span><strong>{basics.shortName}</strong><small>{basics.chineseName}</small></span>
        </button>
        <button className="dao-header-top" onClick={() => scrollTo("top")} aria-label="返回页面顶部"><small>{activeSectionMeta.number}</small><span aria-hidden="true">↑</span></button>
        <button
          className={`dao-menu ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "关闭导航" : "打开导航"}
          aria-controls="dao-main-nav"
          aria-expanded={menuOpen}
        ><span /><span /></button>
        <nav id="dao-main-nav" className={menuOpen ? "open" : ""} aria-label="主导航">
          <button onClick={() => scrollTo("about")}>About <small>缘起</small></button>
          <button onClick={() => scrollTo("questions")}>Subjects <small>议题</small></button>
          <button onClick={() => scrollTo("journey")}>Schedule <small>日程</small></button>
          <button onClick={() => scrollTo("venue")}>Venue <small>地点</small></button>
          <a className="dao-register-nav" href={MICROSOFT_FORM_URL} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>Register <span>↗</span></a>
        </nav>
      </header></div>

      <aside className="dao-page-rail" aria-label="页面章节导航">
        <div className="dao-rail-progress" aria-hidden="true">
          <span>00</span>
          <i><b style={{ height: `${scrollProgress}%` }} /></i>
          <small>{pageSections.at(-1)?.number}</small>
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
          <p className="dao-eyebrow"><span /><BilingualText text={basics.eyebrow} /></p>
          <div className="dao-conference-lockup">
            <h1 lang="en"><span className="dao-conference-opening">{conferenceOpening}</span>{" "}{basics.conferenceName.slice(conferenceOpening.length + 1)}</h1>
            <p className="dao-conference-zh" lang="zh-Hant">{basics.chineseName}</p>
          </div>
          <div className="dao-hero-theme" aria-label="2027年会议主题">
            <strong>{theme.english}</strong>
            <em>{chineseThemeLines.map((line) => <span className="dao-theme-chinese-part" key={line}>{line}</span>)}</em>
          </div>
          <p className="dao-hero-en">{basics.introduction}</p>
          <p className="dao-hero-zh">{basics.chineseIntroduction}</p>
          <div className="dao-actions">
            <a className="dao-primary" href={MICROSOFT_FORM_URL} target="_blank" rel="noopener noreferrer">Conference registration <span>参会注册</span></a>
          </div>
        </div>
        <figure className="dao-hero-image">
          <Image src={publicAsset(media.heroImageUrl)} alt="Mount Wufeng, Jinan / 濟南五峰山" fill priority sizes="(max-width: 760px) 100vw, 48vw" unoptimized />
          <div className="dao-image-wash" />
          <figcaption><span>山</span><p>Mount Wufeng<br /><BilingualText text="Jinan · 濟南五峰山" /></p></figcaption>
        </figure>
        <span className="dao-scroll-mark">SCROLL TO ENTER <i>↓</i></span>
      </section>

      <section className="dao-about dao-section" id="about">
        <div className="dao-section-index"><span>壹</span><small>01 · CONTEXT</small></div>
        <div className="dao-about-title">
          <p className="dao-kicker"><BilingualText text={about.kicker} /></p>
          <h2>{about.titleLine1}<br /><em>{about.titleLine2}</em></h2>
          <p className="dao-section-title-zh" lang="zh-Hant">從本土傳統走向共享世界</p>
        </div>
        <div className="dao-about-copy">
          {about.paragraphs.map((paragraph, index) => <p className={index % 2 ? "zh" : ""} key={index}>{paragraph}</p>)}
        </div>
        <div className="dao-vertical-script" aria-hidden="true">道行天下<br />和而不同</div>
        <div className="dao-about-facts" aria-label="会议日期、地点和语言">
          <div><span><BilingualText text="DATE · 日期" /></span><strong>{basics.monthYear}<br />{basics.dateRange}</strong></div>
          <div><span><BilingualText text="VENUE · 地点" /></span><strong>{basics.city}<br />{basics.venueName}</strong></div>
          <div><span><BilingualText text="LANGUAGE · 语言" /></span><strong><BilingualText text={basics.language} /></strong></div>
        </div>
      </section>

      <section className="dao-theme" id="theme">
        <div className="dao-theme-orbit" aria-hidden="true"><i /><i /></div>
        <div className="dao-section-index light"><span>贰</span><small>02 · THEME</small></div>
        <p><BilingualText text="CONFERENCE THEME · 會議主題" /></p>
        <h2>{theme.english.split(/(?<=:)\s+/).map((line) => <span className="dao-theme-line" key={line}>{line}</span>)}</h2>
        <strong>{chineseThemeLines.map((line) => <span className="dao-theme-chinese-part" key={line}>{line}</span>)}</strong>
      </section>

      <section className="dao-questions dao-section" id="questions">
        <div className="dao-section-index"><span>叁</span><small>03 · SUBJECTS</small></div>
        <div className="dao-section-heading">
          <div><p className="dao-kicker"><BilingualText text="SIX LINES OF INQUIRY · 六個討論方向" /></p><h2>Tracing Daoism<br />across borders</h2><p className="dao-section-title-zh" lang="zh-Hant">探尋道教的跨境傳播</p></div>
          <p><BilingualText text={"Six connected subjects examine how Daoism disseminates through people, institutions, practice, and text.\n六個相互關聯的議題，探討道教如何透過人群、機構、實踐與文本傳播。"} /></p>
        </div>
        <div className="dao-question-grid">
          {topics.map((topic) => <article key={topic.number}><span>{topic.number}</span><div><h3>{topic.title}</h3><p>{topic.description}</p></div></article>)}
        </div>
      </section>

      <section className="dao-format dao-section" id="format">
        <div className="dao-section-index"><span>肆</span><small>04 · FORMAT</small></div>
        <div className="dao-section-heading"><div><p className="dao-kicker"><BilingualText text="PAPERS & PRACTICE · 交流與體驗" /></p><h2>Ways to<br />take part</h2><p className="dao-section-title-zh" lang="zh-Hant">參與會議的方式</p></div><p>Panels and practical workshops are conducted in English and Chinese.<br />專題研討與體驗工作坊，使用英文及中文。</p></div>
        <div className="dao-format-grid">{formats.map((item, index) => <article key={item.title}><span>0{index + 1} · {index === 0 ? "DISCUSSION" : "EXPERIENCE"}</span><h3><BilingualText text={item.title} /></h3><p><BilingualText text={item.body} /></p></article>)}</div>
      </section>

      <section className="dao-journey dao-section" id="journey">
        <div className="dao-section-index light"><span>伍</span><small>05 · SCHEDULE</small></div>
        <div className="dao-section-heading light-heading">
          <div><p className="dao-kicker">MAY 25—29, 2027</p><h2>Five days,<br />from mountain <bdi className="dao-nowrap">to sea</bdi></h2><p className="dao-section-title-zh" lang="zh-Hant">五日行程，從山岳到海濱</p></div>
          <div className="dao-schedule-intro"><p><BilingualText text={"May 26–27: conference on Mount Wufeng.\n5月26—27日：五峰山學術會議。"} /></p><p><BilingualText text={"May 28–29: optional excursion to Mount Tai and Mount Lao via Qingdao.\n5月28—29日：自選泰山與崂山考察，途經青島。"} /></p></div>
        </div>
        <div className="dao-day-tabs" role="tablist" aria-label="选择会议日期" onKeyDown={(event) => {
          if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          const index = event.key === "Home" ? 0 : event.key === "End" ? schedule.length - 1 : (activeDay + (event.key === "ArrowRight" ? 1 : -1) + schedule.length) % schedule.length;
          setActiveDay(index);
          event.currentTarget.querySelectorAll<HTMLButtonElement>("[role=tab]")[index]?.focus();
        }}>
          {schedule.map((day, index) => <button id={`day-tab-${index}`} aria-controls="day-panel" tabIndex={activeDay === index ? 0 : -1} key={`${day.date}-${index}`} className={activeDay === index ? "active" : ""} onClick={() => setActiveDay(index)} role="tab" aria-selected={activeDay === index}><small>0{index + 1}</small><strong>{day.date}</strong><span><BilingualText text={day.weekday} /></span></button>)}
        </div>
        <p className="dao-day-swipe-hint" aria-hidden="true">← 左右滑動日期 · SWIPE DAYS →</p>
        <div className="dao-schedule" id="day-panel" role="tabpanel" aria-labelledby={`day-tab-${activeDay}`} tabIndex={0}>
          {selectedDay?.items.map((item, index) => <article key={`${item.time}-${item.title}-${index}`}><time>{item.time}</time><h3><BilingualText text={item.title} /></h3><span><BilingualText text={item.place} /></span><p><BilingualText text={item.host} /></p></article>)}
        </div>
        <div className="dao-journey-route" aria-label="五峰山、泰山、青岛、崂山行程">
          <div><small><BilingualText text="CONFERENCE · 學術會議" /></small><strong>WUFENG</strong><span><BilingualText text="JINAN · 濟南五峰山" /></span></div>
          <p><i /><em>MOUNT TAI → QINGDAO → MOUNT LAO</em><i /></p>
          <div><small><BilingualText text="OPTIONAL · 自選考察" /></small><strong>28—29 MAY</strong><span>泰山 · 青島 · 崂山</span></div>
        </div>
      </section>

      <section className="dao-organizers dao-section" id="organizers">
        <div className="dao-section-index"><span>陸</span><small>06 · ORGANIZERS</small></div>
        <div className="dao-organizer-intro"><p className="dao-kicker">A GLOBAL SCHOLARLY NETWORK</p><h2><span>People behind</span><span>the conversation</span></h2><p className="dao-section-title-zh" lang="zh-Hant">學術對話的推動者</p><p><BilingualText text={"Conference chairs, keynote speakers, sponsors, co-organizers, and the standing committee.\n會議主席、主題演講嘉賓、主辦協辦機構與常設委員會。"} /></p></div>
        <div className="dao-organizer-directory">
          <div className="dao-directory-tabs" role="tablist" aria-label="主办信息类别" onKeyDown={(event) => {
            if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            const index = event.key === "Home" ? 0 : event.key === "End" ? 2 : (organizerTab + (event.key === "ArrowRight" ? 1 : -1) + 3) % 3;
            setOrganizerTab(index);
            event.currentTarget.querySelectorAll<HTMLButtonElement>("[role=tab]")[index]?.focus();
          }}>{organizerGroups.map((group, index) => <button role="tab" id={`directory-tab-${index}`} aria-controls={`directory-panel-${index}`} aria-selected={organizerTab === index} tabIndex={organizerTab === index ? 0 : -1} onClick={() => setOrganizerTab(index)} key={group.label}><BilingualText text={group.label} /></button>)}</div>
          {organizerGroups.map((group, index) => <div className="dao-organizer-list" role="tabpanel" id={`directory-panel-${index}`} aria-labelledby={`directory-tab-${index}`} hidden={organizerTab !== index} key={group.label}>{group.items.map((item, itemIndex) => <article key={item.name}><span>0{itemIndex + 1}</span><h3>{item.name}</h3>{item.country && <p><BilingualText text={item.country} /></p>}</article>)}</div>)}
        </div>
      </section>

      <section className="dao-field-study" id="field-study" aria-label="泰山与崂山自选考察">
        <div className="dao-canon-image dao-excursion-images"><figure><Image src={publicAsset(media.routeMapUrl)} alt="Ladder to Heaven on Mount Tai / 泰山天梯" fill sizes="(max-width: 760px) 100vw, 38vw" unoptimized /><figcaption>28 MAY · Mount Tai<span>泰山天梯</span></figcaption></figure><figure><Image src={publicAsset(media.excursionImageUrl)} alt="Taiqing Temple on Mount Lao / 崂山太清宮" fill sizes="(max-width: 760px) 100vw, 38vw" unoptimized /><figcaption>29 MAY · Mount Lao<span>崂山太清宮</span></figcaption></figure></div>
        <div className="dao-field-copy"><div className="dao-section-index light"><span>柒</span><small>07 · FIELD STUDY</small></div><p className="dao-kicker"><BilingualText text="MAY 28—29 · OPTIONAL · 自選" /></p><h2>Mountains,<br />then the sea</h2><p className="dao-section-title-zh" lang="zh-Hant">從山岳走向大海</p><p>Leave Mount Wufeng at 08:00 on May 28, visit Mount Tai, and continue to Qingdao for the night. On May 29, visit Mount Lao and return to Qingdao by late afternoon.</p><p className="zh">5月28日退房後08:00出發，考察泰山，再赴青島住宿；29日考察崂山，傍晚前返回青島。此後行程自行安排，會務組可協助機場接送及酒店預訂。</p><div className="dao-distance"><strong>02</strong><span><BilingualText text="DAYS · 兩日" /><br />MOUNT TAI → MOUNT LAO</span></div></div>
      </section>

      <section className="dao-venue dao-section" id="venue">
        <div className="dao-section-index"><span>捌</span><small>08 · VENUE</small></div>
        <div className="dao-venue-card">
          <div className="dao-venue-copy"><p className="dao-kicker"><BilingualText text={venue.kicker} /></p><h2>{venue.name}</h2><p className="dao-section-title-zh" lang="zh-Hant">五峰山</p><p><BilingualText text={venue.address} /></p><p className="zh"><BilingualText text={venue.transport} /></p><div>{venue.tags.map((tag, index) => <span key={`${tag}-${index}`}><BilingualText text={tag} /></span>)}</div></div>
          <figure><Image src={publicAsset(media.campusMapUrl)} alt="Dongzhen Temple on Mount Wufeng / 五峰山洞真觀" fill sizes="(max-width: 760px) 100vw, 50vw" unoptimized /><figcaption><BilingualText text="Dongzhen Temple · 五峰山洞真觀" /></figcaption></figure>
        </div>
      </section>

      <section className="dao-fees dao-section" id="fees">
        <div className="dao-section-index"><span>玖</span><small>09 · FEES</small></div>
        <div className="dao-section-heading"><div><p className="dao-kicker"><BilingualText text="CONFERENCE & EXCURSION · 會議與考察" /></p><h2>Plan your stay</h2><p className="dao-section-title-zh" lang="zh-Hant">規劃參會行程</p></div><p>All prices in US dollars. Hotel charges are separate from the conference and excursion fees.<br />以下均為美元報價；住宿費與會議、考察費分別支付。</p></div>
        <div className="dao-fee-grid">{fees.map((fee) => <article key={fee.title}><h3><BilingualText text={fee.title} /></h3><p className="dao-fee-amount"><small>US $</small>{fee.amount}</p><p><BilingualText text={fee.detail} /></p><span><BilingualText text={fee.payment} /></span></article>)}</div>
        <div className="dao-fee-notes">{feeNotes.map((note) => <p key={note}><BilingualText text={note} /></p>)}</div>
      </section>

      <section className="dao-practical dao-section" id="practical">
        <div className="dao-section-index"><span>拾</span><small>10 · PRACTICAL</small></div>
        <div className="dao-section-heading"><div><p className="dao-kicker"><BilingualText text="BEFORE YOU ARRIVE · 行前資訊" /></p><h2>Your way <br className="dao-title-break" />to Wufeng</h2><p className="dao-section-title-zh" lang="zh-Hant">前往五峰山</p></div><p>Jinan West Railway Station → Metro Line 1 → Gongyanyuan Station → Wufengge Hotel.<br />濟南西站 → 地鐵1號線 → 工研院站 → 五峰閣賓館。</p></div>
        <div className="dao-remark-grid">{remarks.map((item, index) => <article key={`${item.title}-${index}`}><span>0{index + 1}</span><h3><BilingualText text={item.title} /></h3><p><BilingualText text={item.body} /></p></article>)}</div>
      </section>

      <section className="dao-faq dao-section" id="faq">
        <div><p className="dao-kicker"><BilingualText text="11 · QUESTIONS · 常見問題" /></p><h2>Before the journey</h2><p className="dao-section-title-zh" lang="zh-Hant">啟程之前</p><p>Useful answers for participants preparing to come to Jinan.<br />關於報名、住宿、考察與資料展示。</p></div>
        <div className="dao-faq-list">{faqs.map((item, index) => <article className={openFaq === index ? "open" : ""} key={`${item.question}-${index}`}><button onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index}><span><BilingualText text={item.question} /></span><i>{openFaq === index ? "−" : "+"}</i></button><div><p><BilingualText text={item.answer} /></p></div></article>)}</div>
      </section>

      <section className="dao-final dao-registration" id="final">
        <div className="dao-registration-intro">
        <span className="dao-final-seal" aria-hidden="true"><Image src={publicAsset("/dao/wurui-lishu-dao.png")} alt="" width={190} height={190} /></span>
        <p><BilingualText text="12 · REGISTRATION · 参会注册" /></p>
        <h2>Meet us<br /><em>on Mount Wufeng.</em></h2>
        <strong>2027年5月 · 相會五峰山</strong>
        <div className="dao-registration-dates">{importantDates.slice(0, 2).map((date) => <div key={date.date}><time>{date.date}</time><span>{date.title}<br />{date.note}</span></div>)}</div>
        </div>
        <div className="dao-registration-content">
        <div className="dao-registration-materials">{registration.materials.map((item) => <div key={item.title}><h3><BilingualText text={item.title} /></h3><p><BilingualText text={item.body} /></p></div>)}</div>
        <div className="dao-registration-actions">
        <div className="dao-registration-contact">
        <a className="dao-registration-email" href={registrationEmail}>{basics.contactEmail}</a>
        <p className="dao-registration-note">Register online, or email the completed registration form to the address above.<br />請線上報名，或將填妥的報名回執寄至上述郵箱。</p>
        </div>
        <div className="dao-registration-submit">
        <a className="dao-primary inverse" href={MICROSOFT_FORM_URL} target="_blank" rel="noopener noreferrer">Conference registration <span>参会注册</span></a>
        <div className="dao-registration-links"><a href={MICROSOFT_FORM_URL} target="_blank" rel="noopener noreferrer"><BilingualText text="Online registration · 線上報名 ↗" /></a><div className="dao-registration-download"><a href={publicAsset("/dao/dao19-announcement.docx")} download><BilingualText text="Download announcement · 下載會議資料 ↓" /></a>
        <small className="dao-form-context">The download includes the registration form.<br />下載文件附有報名回執。</small>
        </div></div>
        </div>
        </div>
        </div>
      </section>

      <footer className="dao-footer"><div className="dao-footer-brand"><span className="dao-seal" aria-hidden="true"><Image src={publicAsset("/dao/wurui-lishu-dao.png")} alt="" width={190} height={190} /></span><div><strong>{basics.conferenceName}</strong><small>{basics.chineseName}</small></div></div><div><span><BilingualText text="VENUE · 地點" /></span><strong>{basics.venueName}</strong><small>25—29 MAY 2027</small></div><div><span><BilingualText text="CONTACT · 會務聯絡" /></span><a href={registrationEmail}>{basics.contactEmail}</a><small>Deadline · 2027.03.01</small></div><p>© 2027 DAO 19 · International Conference on Daoist Studies</p></footer>
    </main>
  );
}

