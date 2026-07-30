"use client";

import { FormEvent, useEffect, useState } from "react";

const schedule = {
  "11月14日": [
    ["08:30", "签到与欢迎咖啡", "星河厅前厅", "开放交流"],
    ["09:30", "开幕式：从工具智能到科学伙伴", "星河主会场", "大会主席团"],
    ["10:10", "主旨报告：可信机器学习的下一程", "星河主会场", "林若岚 教授"],
    ["11:20", "主旨报告：具身智能与真实世界", "星河主会场", "David Chen 教授"],
    ["14:00", "专题论坛 A：AI for Science", "曙光厅", "六场邀请报告"],
    ["14:00", "专题论坛 B：大模型与社会", "远见厅", "圆桌讨论"],
    ["18:30", "欢迎晚宴与青年学者海报交流", "云庭", "全体参会者"],
  ],
  "11月15日": [
    ["09:00", "主旨报告：计算如何重塑生命科学", "星河主会场", "周砚青 教授"],
    ["10:20", "交叉前沿快闪报告", "星河主会场", "8 位青年学者"],
    ["13:30", "专题论坛 C：智能医学与健康", "曙光厅", "五场邀请报告"],
    ["13:30", "专题论坛 D：科学计算新范式", "远见厅", "五场邀请报告"],
    ["16:30", "产学对话：从实验室到真实影响", "星河主会场", "学界 × 产业界"],
    ["19:00", "城市学术漫步", "滨江步道", "自由参加"],
  ],
  "11月16日": [
    ["09:00", "青年科学家论坛", "曙光厅", "入选论文作者"],
    ["10:40", "开放科学与科研基础设施", "星河主会场", "Maria Rossi 教授"],
    ["13:30", "闭幕圆桌：面向 2030 的共同议程", "星河主会场", "全体主旨嘉宾"],
    ["15:00", "最佳论文与海报颁奖", "星河主会场", "学术委员会"],
    ["15:40", "闭幕致辞", "星河主会场", "大会主席"],
  ],
};

const speakers = [
  { initials: "RL", name: "林若岚", role: "中国科学院院士", org: "清华大学 · 人工智能研究院", topic: "可信机器学习的下一程", tone: "blue" },
  { initials: "DC", name: "David Chen", role: "IEEE Fellow", org: "新加坡国立大学 · 计算机学院", topic: "具身智能与真实世界", tone: "red" },
  { initials: "YZ", name: "周砚青", role: "国家杰出青年基金获得者", org: "浙江大学 · 生命科学研究院", topic: "计算如何重塑生命科学", tone: "gold" },
  { initials: "MR", name: "Maria Rossi", role: "欧洲科学院院士", org: "苏黎世联邦理工学院", topic: "开放科学与科研基础设施", tone: "green" },
];

const topics = [
  ["01", "智能科学基础", "大模型、多模态学习、可信 AI、强化学习与智能体"],
  ["02", "AI for Science", "生命科学、材料发现、气候建模与科学计算新范式"],
  ["03", "技术与社会", "人工智能治理、开放科学、教育创新与普惠技术"],
];

const faqs = [
  ["测试版提交的报名信息会保存吗？", "会。为了完整体验后台，本版本提交的信息会保存到站点数据库，并仅在登录后的报名管理后台中显示。请勿填写身份证号等不必要的敏感信息。"],
  ["会议是否接受论文投稿？", "正式会议拟设置全文投稿与海报摘要两种通道。当前测试版暂未开放文件上传，后续可接入投稿编号、附件上传与审稿状态查询。"],
  ["注册费包含哪些内容？", "演示价格包含会议资料、会期午餐、茶歇及欢迎晚宴；交通与住宿需自行安排。实际收费标准以正式通知为准。"],
  ["可以为团队统一报名吗？", "正式版可以增加团体报名入口、批量导入名单和统一开票功能，测试版暂以个人报名体验为主。"],
];

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
  const [activeDay, setActiveDay] = useState<keyof typeof schedule>("11月14日");
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [draft, setDraft] = useState(emptyDraft);
  const [registrationCode, setRegistrationCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

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

  return (
    <main>
      <div className="demo-bar"><span>后台功能测试版</span> 报名信息将保存至站点数据库，请勿填写不必要的敏感信息</div>

      <header className="site-header">
        <button className="brand" onClick={() => scrollTo("top")} aria-label="返回首页">
          <span className="brand-mark">N</span>
          <span><strong>NEXUS 2026</strong><small>国际智能科学前沿大会</small></span>
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
          <div className="eyebrow"><span /> NEXUS · 第八届国际智能科学前沿大会</div>
          <h1>智能涌现<br /><em>科学共生</em></h1>
          <p className="hero-intro">当人工智能成为科学发现的新伙伴，我们如何共同定义下一种研究范式？与全球学者一起，在学科边界处寻找答案。</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={openRegistration}>立即注册参会 <span>→</span></button>
            <button className="text-button" onClick={() => scrollTo("schedule")}>浏览完整日程 <span>↓</span></button>
          </div>
        </div>
        <div className="hero-visual" aria-label="会议日期及地点">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="orbital-dot dot-one" /><div className="orbital-dot dot-two" /><div className="orbital-dot dot-three" />
          <div className="hero-date"><strong>14—16</strong><span>NOV · 2026</span></div>
          <div className="hero-place"><span>CHINA</span><strong>杭州 · 国际会议中心</strong></div>
        </div>
        <div className="hero-meta">
          <div><span>大会语言</span><strong>中文 / English</strong></div>
          <div><span>早鸟注册截止</span><strong>2026.09.20</strong></div>
          <div><span>主办单位</span><strong>未来科学协作网络</strong></div>
        </div>
      </section>

      <section className="stats" aria-label="大会规模">
        <div><strong>36<sup>+</sup></strong><span>合作高校与机构</span></div>
        <div><strong>48</strong><span>场前沿报告</span></div>
        <div><strong>600<sup>+</sup></strong><span>预计参会代表</span></div>
        <div><strong>12</strong><span>国家与地区</span></div>
      </section>

      <section className="about section" id="about">
        <div className="section-label"><span>01</span> ABOUT NEXUS</div>
        <div className="about-layout">
          <div>
            <p className="kicker">在边界处，发生新的可能</p>
            <h2>一场面向未来的<br />跨学科学术对话</h2>
          </div>
          <div className="about-body">
            <p>NEXUS 2026 聚焦“智能科学与科学智能”的双向融合，邀请计算机科学、生命科学、材料、医学与社会科学领域的研究者，共同讨论人工智能驱动科学发现的关键路径。</p>
            <p>三天时间里，我们将通过主旨报告、专题论坛、青年学者交流与开放圆桌，让好问题遇见新方法，让不同学科真正开始协作。</p>
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
          {topics.map(([number, title, desc]) => (
            <article className="topic-card" key={number}>
              <span className="topic-number">{number}</span>
              <div><h3>{title}</h3><p>{desc}</p></div>
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
              <div className={`speaker-portrait ${speaker.tone}`}><span>{speaker.initials}</span><i /></div>
              <div className="speaker-info"><span>{speaker.role}</span><h3>{speaker.name}</h3><p>{speaker.org}</p><strong>“{speaker.topic}”</strong></div>
            </article>
          ))}
        </div>
        <p className="speaker-note">更多演讲嘉宾将于 2026 年 8 月陆续公布</p>
      </section>

      <section className="schedule section" id="schedule">
        <div className="section-label light"><span>04</span> PROGRAM AT A GLANCE</div>
        <div className="schedule-head"><div><p className="kicker">三天，建立新的连接</p><h2>大会日程</h2></div><p>以下为体验版日程，正式安排可能根据嘉宾行程微调。</p></div>
        <div className="day-tabs" role="tablist" aria-label="选择会议日期">
          {(Object.keys(schedule) as Array<keyof typeof schedule>).map((day, index) => (
            <button key={day} className={activeDay === day ? "active" : ""} onClick={() => setActiveDay(day)} role="tab" aria-selected={activeDay === day}>
              <span>DAY {index + 1}</span><strong>{day}</strong><small>{["星期六", "星期日", "星期一"][index]}</small>
            </button>
          ))}
        </div>
        <div className="schedule-table" role="tabpanel">
          {schedule[activeDay].map(([time, title, place, host]) => (
            <div className="schedule-row" key={`${time}-${title}`}><time>{time}</time><h3>{title}</h3><span>{place}</span><small>{host}</small></div>
          ))}
        </div>
      </section>

      <section className="dates section" id="dates">
        <div className="section-label"><span>05</span> IMPORTANT DATES</div>
        <div className="dates-layout">
          <div><p className="kicker">把重要节点加入日历</p><h2>重要日期</h2><p className="dates-intro">现在报名可享早鸟价格。论文投稿与青年学者论坛申请将于 8 月同步开放。</p></div>
          <div className="date-list">
            <div className="date-item passed"><time>07.15</time><span><strong>大会网站开放</strong><small>已开放</small></span></div>
            <div className="date-item current"><time>08.10</time><span><strong>论文投稿开放</strong><small>即将开始</small></span></div>
            <div className="date-item"><time>09.20</time><span><strong>早鸟注册截止</strong><small>EARLY BIRD</small></span></div>
            <div className="date-item"><time>10.08</time><span><strong>论文投稿截止</strong><small>23:59 CST</small></span></div>
            <div className="date-item"><time>11.14</time><span><strong>大会正式开幕</strong><small>杭州</small></span></div>
          </div>
        </div>
      </section>

      <section className="venue section">
        <div className="venue-card">
          <div className="venue-map" aria-hidden="true"><span className="river river-one" /><span className="river river-two" /><i className="map-pin">N</i><small>杭州</small></div>
          <div className="venue-copy"><div className="section-label light"><span>06</span> VENUE</div><p className="kicker">相聚杭州</p><h2>杭州国际会议中心</h2><p>浙江省杭州市萧山区奔竞大道 353 号<br />距杭州东站约 25 分钟车程</p><div className="venue-tags"><span>地铁 6 号线</span><span>会场酒店协议价</span><span>无障碍通行</span></div></div>
        </div>
      </section>

      <section className="faq section">
        <div className="section-label"><span>07</span> FAQ</div>
        <div className="faq-layout">
          <div><p className="kicker">参会之前</p><h2>常见问题</h2><p>如果没有找到答案，正式版可增加会务组联系方式与在线咨询。</p></div>
          <div className="faq-list">
            {faqs.map(([question, answer], index) => (
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
        <p>NEXUS · HANGZHOU · 2026</p><h2>加入这场面向未来的<br /><em>学术对话</em></h2><button className="primary-button light-button" onClick={openRegistration}>立即注册参会 <span>→</span></button><small>早鸟注册截止：2026 年 9 月 20 日</small>
      </section>

      <footer><div className="footer-brand"><span className="brand-mark">N</span><div><strong>NEXUS 2026</strong><small>国际智能科学前沿大会 · 测试版</small></div></div><div><span>主办</span><strong>未来科学协作网络</strong></div><div><span>会务咨询</span><strong>contact@nexus-demo.org</strong><a className="footer-admin-link" href="/admin">进入报名管理后台 →</a></div><p>© 2026 NEXUS Demo. 本站内容均为体验用途。</p></footer>

      {modalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setModalOpen(false)}>
          <section className="registration-modal" role="dialog" aria-modal="true" aria-labelledby="registration-title">
            <button className="modal-close" onClick={() => setModalOpen(false)} aria-label="关闭报名窗口">×</button>
            <div className="modal-side"><span className="brand-mark inverse">N</span><div><p>REGISTRATION</p><h2>与新的想法<br />在杭州相遇</h2></div><small>2026.11.14—16<br />杭州国际会议中心</small></div>
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
