import { getDb } from "../../../db";
import { registrations } from "../../../db/schema";

type RegistrationPayload = {
  name?: string;
  title?: string;
  organization?: string;
  email?: string;
  phone?: string;
  ticketType?: string;
  attendDinner?: boolean;
  needHotel?: boolean;
};

const clean = (value: unknown, max = 160) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RegistrationPayload;
    const name = clean(payload.name, 60);
    const title = clean(payload.title, 30);
    const organization = clean(payload.organization, 160);
    const email = clean(payload.email, 120).toLowerCase();
    const phone = clean(payload.phone, 40);
    const ticketType = payload.ticketType === "student" ? "student" : "early";

    if (!name || !title || !organization || !email) {
      return Response.json({ error: "请完整填写姓名、称谓、单位和邮箱。" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "请输入有效的电子邮箱。" }, { status: 400 });
    }

    const registrationCode = `NX26-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const db = getDb();
    await db.insert(registrations).values({
      registrationCode,
      name,
      title,
      organization,
      email,
      phone,
      ticketType,
      attendDinner: Boolean(payload.attendDinner),
      needHotel: Boolean(payload.needHotel),
    });

    return Response.json({ registrationCode }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json(
      { error: message.includes("no such table") ? "报名数据库正在初始化，请稍后重试。" : "暂时无法保存报名，请稍后重试。" },
      { status: 500 },
    );
  }
}
