export type Topic = { number: string; title: string; description: string };
export type ScheduleItem = { time: string; title: string; place: string; host: string };
export type ScheduleDay = { date: string; weekday: string; items: ScheduleItem[] };
export type ImportantDate = { date: string; title: string; note: string; state: "passed" | "current" | "future" };
export type FaqItem = { question: string; answer: string };
export type Organizer = { name: string; country: string };
export type Remark = { title: string; body: string };

export type SiteContent = {
  version: 2027;
  basics: {
    shortName: string;
    conferenceName: string;
    chineseName: string;
    eyebrow: string;
    introduction: string;
    chineseIntroduction: string;
    dateRange: string;
    monthYear: string;
    city: string;
    venueName: string;
    language: string;
    announcementDate: string;
    organizer: string;
    contactEmail: string;
  };
  stats: Array<{ value: string; suffix: string; label: string }>;
  about: { kicker: string; titleLine1: string; titleLine2: string; paragraphs: string[] };
  theme: { english: string; chinese: string };
  topics: Topic[];
  organizers: Organizer[];
  schedule: ScheduleDay[];
  importantDates: ImportantDate[];
  venue: { kicker: string; name: string; address: string; transport: string; tags: string[] };
  remarks: Remark[];
  faqs: FaqItem[];
  media: { heroImageUrl: string; canonImageUrl: string; campusMapUrl: string; routeMapUrl: string };
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  version: 2027,
  basics: {
    shortName: "DAO 19 · 2027",
    conferenceName: "The 19th International Conference on Daoist Studies",
    chineseName: "第十九屆國際道學研討會",
    eyebrow: "ANNOUNCEMENT NO. 1 · 會議公告（第一號）",
    introduction: "A global gathering for the study of Daoism beyond borders—its ideas, living practices, communities, and scriptures.",
    chineseIntroduction: "聚焦道教在海外的傳播與影響，連結思想、實踐、信仰群體與典籍流傳的跨文化學術對話。",
    dateRange: "14—18",
    monthYear: "JULY · 2027",
    city: "JINAN · CHINA",
    venueName: "Shandong University · Central Campus",
    language: "English / 中文",
    announcementDate: "May 4, 2026 · 2026年5月4日",
    organizer: "International Organizing Committee",
    contactEmail: "",
  },
  stats: [
    { value: "19", suffix: "TH", label: "International Conference" },
    { value: "06", suffix: "", label: "Research questions" },
    { value: "05", suffix: "D", label: "Conference journey" },
    { value: "75", suffix: "KM", label: "From Jinan to Mount Tai" },
  ],
  about: {
    kicker: "A LIVING TRADITION · 一個活的傳統",
    titleLine1: "From native tradition",
    titleLine2: "to a shared world",
    paragraphs: [
      "As a native religion of China, Daoism has profoundly shaped Chinese society, culture, everyday life, and national character. Beyond China, it has also been encountered, interpreted, and revered by communities across the world.",
      "作為中國的本土宗教，道教深刻影響中國古代社會、文化、民眾生活與民族性格，也在海外各地被認識、實踐乃至崇奉。全面而深入地研究其海外傳播，具有重要的學術與文化意義。",
    ],
  },
  theme: {
    english: "The Overseas Dissemination of Daoism: Ideas, Practices, and Scriptures",
    chinese: "道教的海外傳播：觀念、行為與典籍",
  },
  topics: [
    { number: "01", title: "Communities & Lineages", description: "海外信仰群體、宮觀廟宇、傳承法脈與傳播途徑" },
    { number: "02", title: "Ideas & Everyday Life", description: "道教思想對海外民眾精神世界與現實生活的影響" },
    { number: "03", title: "Medicine, Ritual & Cultivation", description: "海外民眾對道教醫藥、法術、儀式與修煉的實踐" },
    { number: "04", title: "Society, Culture & Religion", description: "海外道教與當地社會、文化、族群及宗教的關係" },
    { number: "05", title: "Tradition & Folk Belief", description: "海外道教與中國傳統宗教、民間信仰的互動" },
    { number: "06", title: "Scriptures in Motion", description: "道教典籍在世界各地的流傳、收藏與再詮釋" },
  ],
  organizers: [
    { name: "Shandong University", country: "China · 中國" },
    { name: "Boston University", country: "USA · 美國" },
    { name: "Chinese Research Association of Laozi Daoist Culture", country: "China · 中國" },
    { name: "Society for the Study of Religious Philosophy", country: "Taiwan, China · 中國臺灣" },
    { name: "Daejin University", country: "Korea · 韓國" },
    { name: "Education Foundation of Three Religions", country: "Indonesia · 印尼" },
  ],
  schedule: [
    { date: "JUL 14", weekday: "抵達濟南 · ARRIVAL", items: [{ time: "ALL DAY", title: "Arrival in Jinan", place: "Jinan · 濟南", host: "Registration and check-in" }] },
    { date: "JUL 15—16", weekday: "學術會議 · CONFERENCE", items: [{ time: "FULL DAY", title: "Conference sessions", place: "Shandong University", host: "Keynotes, panels and discussion" }, { time: "16 JUL", title: "Transfer option I", place: "Jinan → Tai'an", host: "18:30 departure" }] },
    { date: "JUL 17", weekday: "泰山考察 · FIELD STUDY", items: [{ time: "08:00", title: "Transfer option II", place: "Jinan → Tai'an", host: "Morning departure" }, { time: "FULL DAY", title: "Mount Tai and Daoist temples", place: "Mount Tai · 泰山", host: "Academic field visit" }] },
    { date: "JUL 18", weekday: "離會 · DEPARTURE", items: [{ time: "ALL DAY", title: "Departure", place: "Tai'an / Jinan", host: "End of conference journey" }] },
  ],
  importantDates: [
    { date: "2026.05.04", title: "Announcement No. 1", note: "會議公告發布", state: "passed" },
    { date: "2027.07.14", title: "Arrival in Jinan", note: "抵達濟南", state: "future" },
    { date: "2027.07.15", title: "Conference opens", note: "研討會開幕", state: "current" },
    { date: "2027.07.17", title: "Mount Tai field study", note: "泰山及宮觀考察", state: "future" },
  ],
  venue: {
    kicker: "HOST CITY · 泉城濟南",
    name: "Shandong University · Central Campus",
    address: "No. 27 Shanda South Road, Jinan, Shandong, China 250100",
    transport: "中國山東省濟南市山大南路27號 · 會後赴泰山考察，兩地相距約75公里。",
    tags: ["Central Campus", "Conference venue", "Campus dining", "Accommodation assistance"],
  },
  remarks: [
    { title: "Accommodation · 住宿", body: "The committee plans to assist with rooms at the Scholars’ Dormitory. If full, participants may book nearby hotels independently. 擬協助預訂校內學人大廈，房滿時可自行預訂校園周邊酒店。" },
    { title: "Dining · 餐飲", body: "Campus dining is available via Alipay or WeChat; restaurants around the campus are another option. 會議期間可在山東大學食堂用餐，亦可自行選擇校園周邊餐館。" },
    { title: "Mount Tai · 泰山考察", body: "The planned day visit includes a 75 km coach transfer. Admission and cable-car costs are paid separately according to the final arrangement. 擬包車前往泰山，門票及纜車費用依最終安排另行支付。" },
    { title: "Campus access · 入校手續", body: "Names, passport numbers, and phone numbers will be collected securely by the committee before arrival for campus access. 入校所需身份資料將由會務組另行以安全方式收集，請勿在公開表單填寫護照號碼。" },
  ],
  faqs: [
    { question: "Where will the conference take place? / 會議在哪裡舉行？", answer: "At the Central Campus of Shandong University in Jinan, China. 會議地點為中國濟南山東大學中心校區。" },
    { question: "Is accommodation included? / 是否包含住宿？", answer: "Accommodation is not stated as included. The committee plans to assist with dormitory booking, with nearby hotels as alternatives. 公告未說明住宿包含在內；會務組擬協助預訂校內住宿。" },
    { question: "What happens after the conference? / 會後有何安排？", answer: "A one-day academic field visit to Mount Tai and its Daoist temples is planned for July 17. 7月17日擬考察泰山及其宮觀。" },
    { question: "Should passport details be entered here? / 是否在網站填寫護照資料？", answer: "No. This test registration form does not collect passport numbers. The committee will provide a secure process later. 不需要；本測試表單不收集護照號碼，會務組將另行提供安全渠道。" },
  ],
  media: {
    heroImageUrl: "/dao/mount-tai.jpg",
    canonImageUrl: "/dao/daoist-canon.jpeg",
    campusMapUrl: "/dao/campus-map.png",
    routeMapUrl: "/dao/jinan-mount-tai-route.png",
  },
};

export function parseSiteContent(value: string | null | undefined): SiteContent {
  if (!value) return DEFAULT_SITE_CONTENT;
  try {
    const parsed = JSON.parse(value) as SiteContent;
    return parsed?.version === 2027 && parsed?.basics && Array.isArray(parsed.topics) ? parsed : DEFAULT_SITE_CONTENT;
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}
