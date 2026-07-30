export type Topic = { number: string; title: string; description: string };
export type Speaker = { initials: string; name: string; role: string; organization: string; topic: string; tone: string; imageUrl: string };
export type ScheduleItem = { time: string; title: string; place: string; host: string };
export type ScheduleDay = { date: string; weekday: string; items: ScheduleItem[] };
export type ImportantDate = { date: string; title: string; note: string; state: "passed" | "current" | "future" };
export type FaqItem = { question: string; answer: string };

export type SiteContent = {
  basics: {
    shortName: string;
    conferenceName: string;
    eyebrow: string;
    themeLine1: string;
    themeLine2: string;
    introduction: string;
    dateRange: string;
    monthYear: string;
    city: string;
    venueName: string;
    language: string;
    earlyBirdDeadline: string;
    organizer: string;
    contactEmail: string;
  };
  stats: Array<{ value: string; suffix: string; label: string }>;
  about: { kicker: string; titleLine1: string; titleLine2: string; paragraphs: string[] };
  topics: Topic[];
  speakers: Speaker[];
  schedule: ScheduleDay[];
  importantDates: ImportantDate[];
  venue: { kicker: string; name: string; address: string; transport: string; tags: string[] };
  faqs: FaqItem[];
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  basics: {
    shortName: "NEXUS 2026",
    conferenceName: "国际智能科学前沿大会",
    eyebrow: "NEXUS · 第八届国际智能科学前沿大会",
    themeLine1: "智能涌现",
    themeLine2: "科学共生",
    introduction: "当人工智能成为科学发现的新伙伴，我们如何共同定义下一种研究范式？与全球学者一起，在学科边界处寻找答案。",
    dateRange: "14—16",
    monthYear: "NOV · 2026",
    city: "杭州",
    venueName: "杭州国际会议中心",
    language: "中文 / English",
    earlyBirdDeadline: "2026.09.20",
    organizer: "未来科学协作网络",
    contactEmail: "contact@nexus-demo.org",
  },
  stats: [
    { value: "36", suffix: "+", label: "合作高校与机构" },
    { value: "48", suffix: "", label: "场前沿报告" },
    { value: "600", suffix: "+", label: "预计参会代表" },
    { value: "12", suffix: "", label: "国家与地区" },
  ],
  about: {
    kicker: "在边界处，发生新的可能",
    titleLine1: "一场面向未来的",
    titleLine2: "跨学科学术对话",
    paragraphs: [
      "NEXUS 2026 聚焦“智能科学与科学智能”的双向融合，邀请计算机科学、生命科学、材料、医学与社会科学领域的研究者，共同讨论人工智能驱动科学发现的关键路径。",
      "三天时间里，我们将通过主旨报告、专题论坛、青年学者交流与开放圆桌，让好问题遇见新方法，让不同学科真正开始协作。",
    ],
  },
  topics: [
    { number: "01", title: "智能科学基础", description: "大模型、多模态学习、可信 AI、强化学习与智能体" },
    { number: "02", title: "AI for Science", description: "生命科学、材料发现、气候建模与科学计算新范式" },
    { number: "03", title: "技术与社会", description: "人工智能治理、开放科学、教育创新与普惠技术" },
  ],
  speakers: [
    { initials: "RL", name: "林若岚", role: "中国科学院院士", organization: "清华大学 · 人工智能研究院", topic: "可信机器学习的下一程", tone: "blue", imageUrl: "" },
    { initials: "DC", name: "David Chen", role: "IEEE Fellow", organization: "新加坡国立大学 · 计算机学院", topic: "具身智能与真实世界", tone: "red", imageUrl: "" },
    { initials: "YZ", name: "周砚青", role: "国家杰出青年基金获得者", organization: "浙江大学 · 生命科学研究院", topic: "计算如何重塑生命科学", tone: "gold", imageUrl: "" },
    { initials: "MR", name: "Maria Rossi", role: "欧洲科学院院士", organization: "苏黎世联邦理工学院", topic: "开放科学与科研基础设施", tone: "green", imageUrl: "" },
  ],
  schedule: [
    { date: "11月14日", weekday: "星期六", items: [
      { time: "08:30", title: "签到与欢迎咖啡", place: "星河厅前厅", host: "开放交流" },
      { time: "09:30", title: "开幕式：从工具智能到科学伙伴", place: "星河主会场", host: "大会主席团" },
      { time: "10:10", title: "主旨报告：可信机器学习的下一程", place: "星河主会场", host: "林若岚 教授" },
      { time: "11:20", title: "主旨报告：具身智能与真实世界", place: "星河主会场", host: "David Chen 教授" },
      { time: "14:00", title: "专题论坛 A：AI for Science", place: "曙光厅", host: "六场邀请报告" },
      { time: "14:00", title: "专题论坛 B：大模型与社会", place: "远见厅", host: "圆桌讨论" },
      { time: "18:30", title: "欢迎晚宴与青年学者海报交流", place: "云庭", host: "全体参会者" },
    ] },
    { date: "11月15日", weekday: "星期日", items: [
      { time: "09:00", title: "主旨报告：计算如何重塑生命科学", place: "星河主会场", host: "周砚青 教授" },
      { time: "10:20", title: "交叉前沿快闪报告", place: "星河主会场", host: "8 位青年学者" },
      { time: "13:30", title: "专题论坛 C：智能医学与健康", place: "曙光厅", host: "五场邀请报告" },
      { time: "13:30", title: "专题论坛 D：科学计算新范式", place: "远见厅", host: "五场邀请报告" },
      { time: "16:30", title: "产学对话：从实验室到真实影响", place: "星河主会场", host: "学界 × 产业界" },
      { time: "19:00", title: "城市学术漫步", place: "滨江步道", host: "自由参加" },
    ] },
    { date: "11月16日", weekday: "星期一", items: [
      { time: "09:00", title: "青年科学家论坛", place: "曙光厅", host: "入选论文作者" },
      { time: "10:40", title: "开放科学与科研基础设施", place: "星河主会场", host: "Maria Rossi 教授" },
      { time: "13:30", title: "闭幕圆桌：面向 2030 的共同议程", place: "星河主会场", host: "全体主旨嘉宾" },
      { time: "15:00", title: "最佳论文与海报颁奖", place: "星河主会场", host: "学术委员会" },
      { time: "15:40", title: "闭幕致辞", place: "星河主会场", host: "大会主席" },
    ] },
  ],
  importantDates: [
    { date: "07.15", title: "大会网站开放", note: "已开放", state: "passed" },
    { date: "08.10", title: "论文投稿开放", note: "即将开始", state: "current" },
    { date: "09.20", title: "早鸟注册截止", note: "EARLY BIRD", state: "future" },
    { date: "10.08", title: "论文投稿截止", note: "23:59 CST", state: "future" },
    { date: "11.14", title: "大会正式开幕", note: "杭州", state: "future" },
  ],
  venue: {
    kicker: "相聚杭州",
    name: "杭州国际会议中心",
    address: "浙江省杭州市萧山区奔竞大道 353 号",
    transport: "距杭州东站约 25 分钟车程",
    tags: ["地铁 6 号线", "会场酒店协议价", "无障碍通行"],
  },
  faqs: [
    { question: "测试版提交的报名信息会保存吗？", answer: "会。为了完整体验后台，本版本提交的信息会保存到站点数据库，并仅在登录后的报名管理后台中显示。请勿填写身份证号等不必要的敏感信息。" },
    { question: "会议是否接受论文投稿？", answer: "正式会议拟设置全文投稿与海报摘要两种通道。当前测试版暂未开放文件上传，后续可接入投稿编号、附件上传与审稿状态查询。" },
    { question: "注册费包含哪些内容？", answer: "演示价格包含会议资料、会期午餐、茶歇及欢迎晚宴；交通与住宿需自行安排。实际收费标准以正式通知为准。" },
    { question: "可以为团队统一报名吗？", answer: "正式版可以增加团体报名入口、批量导入名单和统一开票功能，测试版暂以个人报名体验为主。" },
  ],
};

export function parseSiteContent(value: string | null | undefined): SiteContent {
  if (!value) return DEFAULT_SITE_CONTENT;
  try {
    const parsed = JSON.parse(value) as SiteContent;
    return parsed?.basics && Array.isArray(parsed.speakers) ? parsed : DEFAULT_SITE_CONTENT;
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}
