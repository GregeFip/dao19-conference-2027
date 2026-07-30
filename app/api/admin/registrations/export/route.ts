import { desc } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { registrations } from "../../../../../db/schema";
import { getChatGPTUser } from "../../../../chatgpt-auth";

const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "请先登录管理后台。" }, { status: 401 });

  const rows = await getDb().select().from(registrations).orderBy(desc(registrations.createdAt));
  const header = ["报名编号", "姓名", "称谓", "所在单位", "电子邮箱", "手机号码", "票种", "欢迎晚宴", "酒店信息", "报名状态", "报名时间"];
  const body = rows.map((row) => [
    row.registrationCode,
    row.name,
    row.title,
    row.organization,
    row.email,
    row.phone,
    row.ticketType === "student" ? "学生票" : "早鸟票",
    row.attendDinner ? "是" : "否",
    row.needHotel ? "是" : "否",
    row.status === "confirmed" ? "已确认" : row.status,
    row.createdAt,
  ]);
  const csv = `\uFEFF${[header, ...body].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
  const filename = `nexus-2026-registrations-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
