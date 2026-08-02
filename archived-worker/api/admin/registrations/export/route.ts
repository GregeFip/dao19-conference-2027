import { desc } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { registrations } from "../../../../../db/schema";
import { getAdminUser } from "../../../../admin-auth";

const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET() {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: "请先登录管理后台。" }, { status: 401 });

  const rows = await getDb().select().from(registrations).orderBy(desc(registrations.createdAt));
  const header = ["登记编号", "姓名", "称谓", "所在单位", "电子邮箱", "手机号码", "参会身份", "泰山考察", "住宿协助", "登记状态", "登记时间"];
  const body = rows.map((row) => [
    row.registrationCode,
    row.name,
    row.title,
    row.organization,
    row.email,
    row.phone,
    row.ticketType === "student" ? "学生" : "学者",
    row.attendDinner ? "是" : "否",
    row.needHotel ? "是" : "否",
    row.status === "confirmed" ? "已确认" : row.status,
    row.createdAt,
  ]);
  const csv = `\uFEFF${[header, ...body].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
  const filename = `dao-19-2027-registrations-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
