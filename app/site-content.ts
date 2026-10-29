export type Topic = { number: string; title: string; description: string };
export type ScheduleItem = { time: string; title: string; place: string; host: string };
export type ScheduleDay = { date: string; weekday: string; items: ScheduleItem[] };
export type ImportantDate = { date: string; title: string; note: string; state: "passed" | "current" | "future" };
export type FaqItem = { question: string; answer: string };
export type Organizer = { name: string; country: string };
export type Remark = { title: string; body: string };
export type Fee = { amount: string; title: string; detail: string; payment: string };

export type SiteContent = {
  version: 2027;
  basics: {
    shortName: string; conferenceName: string; chineseName: string; eyebrow: string;
    introduction: string; chineseIntroduction: string; dateRange: string; monthYear: string;
    city: string; venueName: string; language: string; announcementDate: string;
    organizer: string; contactEmail: string;
  };
  stats: Array<{ value: string; suffix: string; label: string }>;
  about: { kicker: string; titleLine1: string; titleLine2: string; paragraphs: string[] };
  theme: { english: string; chinese: string };
  topics: Topic[];
  organizers: Organizer[];
  academicGuests: Organizer[];
  standingCommittee: Organizer[];
  formats: Remark[];
  schedule: ScheduleDay[];
  importantDates: ImportantDate[];
  venue: { kicker: string; name: string; address: string; transport: string; tags: string[] };
  fees: Fee[];
  feeNotes: string[];
  remarks: Remark[];
  faqs: FaqItem[];
  registration: { subject: string; materials: Remark[]; note: string };
  media: { heroImageUrl: string; canonImageUrl: string; campusMapUrl: string; routeMapUrl: string; excursionImageUrl: string };
};

// Conference facts transcribed from the supplied 19DaoConf (3).docx.
export const DEFAULT_SITE_CONTENT: SiteContent = {
  version: 2027,
  basics: {
    shortName: "DAO 19 · 2027",
    conferenceName: "The 19th International Conference on Daoist Studies",
    chineseName: "第十九屆國際道學研討會",
    eyebrow: "MAY 25—29, 2027 · 中國濟南五峰山",
    introduction: "May 25–29, 2027 · Mount Wufeng, Jinan, Shandong, China.",
    chineseIntroduction: "5月25日報到 · 26—27日學術會議 · 28—29日自選泰山、崂山考察。",
    dateRange: "25—29",
    monthYear: "MAY · 2027",
    city: "JINAN · CHINA",
    venueName: "Mount Wufeng · Jinan",
    language: "English / 中文",
    announcementDate: "",
    organizer: "Guo Wu · Livia Kohn",
    contactEmail: "sdufroum@163.com",
  },
  stats: [
    { value: "19", suffix: "TH", label: "International Conference" },
    { value: "06", suffix: "", label: "Research questions" },
    { value: "05", suffix: "D", label: "Conference and excursion" },
    { value: "02", suffix: "", label: "Working languages" },
  ],
  about: {
    kicker: "A LIVING TRADITION · 一個活的傳統",
    titleLine1: "From native tradition",
    titleLine2: "to a shared world",
    paragraphs: [
      "Daoism has profoundly shaped Chinese society, culture, everyday life, and national character. Beyond China, it has also been recognized and revered. A comprehensive, systematic study of its overseas dissemination and influence holds great academic and cultural significance.",
      "道教作為中國本土宗教，深刻影響中國社會、文化、生活方式與民族性格，也在海外受到認識乃至崇奉。全面、系統、深入地研究道教在海外的傳播與影響，具有重要的學術價值與文化意義。",
    ],
  },
  theme: {
    english: "Daoism Overseas: Ideas, Practices, and Scriptures",
    chinese: "道教在海外：觀念、實踐與典籍",
  },
  topics: [
    { number: "01", title: "Communities & Lineages", description: "世界各地的道教信仰群體、宮觀廟宇、傳承法脈與傳播方式" },
    { number: "02", title: "Ideas & Everyday Life", description: "道教思想對海外民眾精神世界與日常生活的影響" },
    { number: "03", title: "Medicine, Ritual & Cultivation", description: "中國以外的道教醫藥、法術、儀式與修煉實踐" },
    { number: "04", title: "Society, Culture & Religion", description: "海外道教與當地社會、文化、族群及宗教的關係" },
    { number: "05", title: "Tradition & Folk Belief", description: "海外道教與中國傳統宗教、民間信仰的關係" },
    { number: "06", title: "Scriptures & Collections", description: "道教典籍在世界各地的傳播與收藏" },
  ],
  academicGuests: [
    { name: "Guo Wu", country: "CHAIR · Shandong University" },
    { name: "Livia Kohn", country: "CO-CHAIR · Boston University" },
    { name: "LAI ChiTim", country: "KEYNOTE · Chinese University of Hong Kong, Hong Kong" },
    { name: "Further keynote to be announced", country: "其他主題演講嘉賓待公布" },
  ],
  organizers: [
    { name: "Research Center for Overseas Communication of Traditional Chinese Culture, Shandong University", country: "SPONSOR · China" },
    { name: "Three Pines Press", country: "SPONSOR · USA" },
    { name: "The Chinese Research Association of Laozi Daoist Culture", country: "CO-ORGANIZER · China" },
    { name: "Daoist Association of Shandong Province", country: "CO-ORGANIZER · China" },
    { name: "Chinese Society for the Study of Religious Philosophy", country: "CO-ORGANIZER · Taiwan, China" },
    { name: "World Taoist Culture Alliance", country: "CO-ORGANIZER · USA" },
  ],
  standingCommittee: [
    { name: "Guo Wu · Han Jishao", country: "China (Mainland) · 中國大陸" },
    { name: "Liou Tong-Miin · Fiona Chang", country: "China (Taiwan) · 中國臺灣" },
    { name: "Georges Favraud", country: "France · 法國" },
    { name: "Friederike Assandri · Johan Hausen", country: "Germany · 德國" },
    { name: "Serban Toader", country: "Romania · 羅馬尼亞" },
    { name: "Robin R. Wang · Liu Xun", country: "USA · 美國" },
  ],
  formats: [
    { title: "Panels · 專題研討", body: "Three 25-minute or four 20-minute papers on a panel theme, followed by open discussion. Each panel lasts 1.5–2 hours. 每組安排3場25分鐘或4場20分鐘論文報告，隨後開放討論；每組總時長為1.5—2小時。" },
    { title: "Workshops · 體驗工作坊", body: "Practical experience of Daoist cultivation, martial arts (taiji quan), and Daoist medicine, lasting 1.5–2 hours. The room has no tables, chairs, or PPT equipment. 以道教修煉、太極拳等武術及道教醫藥的實際體驗為主，時長1.5—2小時；場地不設桌椅及PPT設備。" },
  ],
  schedule: [
    { date: "MAY 25", weekday: "TUE · 報到", items: [
      { time: "15:00–18:30", title: "Arrival & check-in · 報到", place: "Wufengge Hotel · 五峰閣賓館", host: "Arrive at Mount Wufeng. Dinner is provided. 抵達五峰山，當日提供晚餐。" },
      { time: "18:00", title: "Shuttle to the hotel · 接駁車", place: "Gongyanyuan Station · 工研院站B出口", host: "A shuttle waits at Exit B of Metro Line 1 Gongyanyuan Station. 地鐵1號線工研院站B出口集合。" },
    ] },
    { date: "MAY 26", weekday: "WED · 開幕", items: [
      { time: "09:00", title: "Opening ceremony · 開幕式", place: "Mount Wufeng · 五峰山", host: "A brief opening ceremony followed by keynote speeches. 簡短開幕式後舉行主題演講。" },
      { time: "DAYTIME", title: "Panels & workshops · 研討與工作坊", place: "Conference sessions · 學術會議", host: "Paper presentations, discussion, and practical workshops. 會議使用英文及中文。" },
    ] },
    { date: "MAY 27", weekday: "THU · 會議", items: [
      { time: "DAYTIME", title: "Continuing sessions · 學術交流", place: "Mount Wufeng · 五峰山", host: "Keynotes, panels, and workshops continue. 主題演講、專題研討與工作坊繼續進行。" },
      { time: "AFTERNOON", title: "Closing plenary · 閉幕大會", place: "Conference venue · 會場", host: "Nearby Daoist temples may be visited after the closing plenary. 閉幕大會後可參訪附近道觀。" },
    ] },
    { date: "MAY 28", weekday: "FRI · 泰山", items: [
      { time: "08:00", title: "Optional excursion · 自選考察", place: "Mount Wufeng → Mount Tai · 五峰山→泰山", host: "Check out before departing by bus for Mount Tai. 退房後乘巴士出發考察泰山。" },
      { time: "AFTER VISIT", title: "Continue to Qingdao · 赴青島", place: "Qingdao · 青島", host: "Travel to Qingdao after the Mount Tai visit and stay overnight. 泰山考察後赴青島住宿。" },
    ] },
    { date: "MAY 29", weekday: "SAT · 崂山", items: [
      { time: "DAYTIME", title: "Mount Lao excursion · 崂山考察", place: "Mount Lao · 崂山", host: "The optional excursion continues with a visit to Mount Lao. 繼續自選行程，考察崂山。" },
      { time: "LATE PM", title: "Return to Qingdao · 返回青島", place: "Qingdao · 青島", host: "Onward travel is self-arranged; airport transfers and hotel reservations can be assisted. 傍晚前返回青島，此後自行安排行程；會務組可協助機場接送及訂房。" },
    ] },
  ],
  importantDates: [
    { date: "2027.03.01", title: "Registration & abstracts due", note: "報名截止、摘要提交", state: "current" },
    { date: "2027.04.01", title: "Program on website", note: "網站公布會議議程", state: "future" },
    { date: "2027.05.25", title: "Arrival & check-in", note: "抵達五峰山報到", state: "future" },
    { date: "2027.05.26—27", title: "Conference sessions", note: "學術會議", state: "future" },
  ],
  venue: {
    kicker: "MOUNT WUFENG · 濟南五峰山",
    name: "Mount Wufeng",
    address: "Jinan, Shandong, China · 中國山東濟南五峰山",
    transport: "Check-in: Wufengge Hotel 五峰閣賓館 · May 25, 15:00–18:30. 報到地點：五峰閣賓館；5月25日15:00—18:30。",
    tags: ["Wufengge Hotel · 五峰閣賓館", "Dongzhen Temple · 洞真觀", "English & Chinese · 中英雙語"],
  },
  fees: [
    { amount: "80", title: "Conference · 會議費", detail: "Includes all meals on Mount Wufeng. 包含五峰山會議期間全部餐食。", payment: "Cash upon arrival · 抵達時現金支付" },
    { amount: "150", title: "Wufengge Hotel · 五峰閣", detail: "Three nights, double occupancy. 三晚，雙人入住。", payment: "Payable at the hotel · 直接向酒店支付" },
    { amount: "100", title: "Excursion · 自選考察", detail: "Two days: bus, cable cars, admission, meals, and local guides. 兩日巴士、纜車、門票、餐食及當地導遊。", payment: "Cash upon arrival · 抵達時現金支付" },
    { amount: "80", title: "Qingdao Hotel · 青島住宿", detail: "One night, double occupancy. 一晚，雙人入住。", payment: "Payable at the hotel · 直接向酒店支付" },
  ],
  feeNotes: [
    "If staying at the same hotel near Qingdao airport on May 29 as well, the two-night hotel charge is US $160. 5月29日晚如續住青島機場附近同一酒店，兩晚住宿費為160美元。",
    "Alternative accommodation: Fengshan kuaijie 峰山快捷賓館 or Xingdong Hotel 星東旅館; book independently. 其他住宿可自行預訂峰山快捷賓館或星東旅館。",
  ],
  remarks: [
    { title: "Arriving in Jinan · 抵達濟南", body: "Arrive at Yaoqiang Airport, then travel to Jinan West Railway Station. Trains from other cities are another option. 建議從濟南遙牆機場轉往濟南西站；亦可由其他城市乘火車抵達。" },
    { title: "Metro & taxi · 地鐵與出租車", body: "From Jinan West take Metro Line 1 to Gongyanyuan Station, then a taxi to Wufengge Hotel (about US $4). 濟南西站乘地鐵1號線至工研院站，再乘出租車前往五峰閣賓館，車費約4美元。" },
    { title: "Arrival shuttle · 報到接駁", body: "On May 25 at 18:00, a shuttle bus will wait at Exit B of Gongyanyuan Station and travel to the hotel. 5月25日18:00，會務接駁巴士將在工研院站B出口等候，接送參會者前往酒店。" },
    { title: "Travel payments · 交通支付", body: "NIHAO CHINA: register and link a bank or credit card for metro and bus ride codes. Exchange some RMB on arrival. 建議下載NIHAO CHINA，註冊並綁定銀行卡或信用卡，使用地鐵、巴士乘車碼；入境時兌換部分人民幣。" },
  ],
  faqs: [
    { question: "Where and when? / 何時、何地舉行？", answer: "Mount Wufeng, Jinan, Shandong, China. Check-in is May 25; conference sessions are May 26–27, 2027. Optional excursions follow on May 28–29. 中國山東濟南五峰山；2027年5月25日報到，26—27日學術會議，28—29日自選考察。" },
    { question: "How do I register? / 如何報名？", answer: "Complete the online registration form by March 1, 2027. Abstracts are due on the same date. For enquiries, contact sdufroum@163.com. 請於2027年3月1日前填寫線上報名表；摘要亦於同日截止。如有疑問，請聯絡會務郵箱 sdufroum@163.com。" },
    { question: "What are the hotel arrangements? / 如何安排住宿？", answer: "Wufengge Hotel: US $150 for three nights, double occupancy; pay at the hotel. Name your roommate or request roommate matching when registering. Self-arranged accommodation is also possible. 五峰閣賓館三晚雙人入住費用為150美元，直接向酒店付款；報名時請註明室友或是否需要協助配對，亦可自行安排住宿。" },
    { question: "Is the excursion optional? / 考察是否自願參加？", answer: "Yes. The May 28–29 excursion visits Mount Tai and Mount Lao via Qingdao. The US $100 fee includes transport, cable cars, tickets, meals, and guides; Qingdao hotel charges are separate. 是，自選考察經青島參訪泰山及崂山。100美元考察費包含交通、纜車、門票、餐食及導遊；青島酒店另付。" },
    { question: "Can I display books or materials? / 可否展示圖書及資料？", answer: "A limited number of tables will be available free of charge for fliers, pamphlets, books, CDs, and other materials. 提供有限數量的免費展桌，可分發宣傳單、冊子，以及銷售圖書、CD等資料。" },
  ],
  registration: {
    subject: "DAO 19 2027 Conference Registration",
    materials: [
      { title: "Personal details · 個人資料", body: "Name, institution, nationality, ID or passport number, email address, and phone number. 姓名、單位、國籍、身份證或護照號碼、電子郵箱及電話。" },
      { title: "Paper & arrangements · 論文與安排", body: "Paper title if presenting; main-hotel room request, roommate name or matching request, or self-arranged lodging; whether you will join the excursion. 發表者請附論文題目；說明住宿、室友或配對需求，以及是否參加考察。" },
    ],
    note: "Registration closes and abstracts are due March 1, 2027. The program will be published on the website April 1, 2027. 報名與摘要提交截止：2027年3月1日；會議議程將於4月1日在網站公布。",
  },
  media: {
    heroImageUrl: "/dao/mount-wufeng.webp",
    canonImageUrl: "/dao/daoist-canon.jpeg",
    campusMapUrl: "/dao/dongzhen-temple.webp",
    routeMapUrl: "/dao/mount-tai.jpg",
    excursionImageUrl: "/dao/mount-lao.webp",
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
