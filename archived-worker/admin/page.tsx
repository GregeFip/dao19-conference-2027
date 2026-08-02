import { desc } from "drizzle-orm";
import { getDb } from "../../db";
import { registrations } from "../../db/schema";
import { adminSignOutPath, requireAdminUser } from "../admin-auth";
import AdminDashboard from "./AdminDashboard";
import "./admin.css";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireAdminUser("/admin");
  const rows = await getDb().select().from(registrations).orderBy(desc(registrations.createdAt));

  return (
    <AdminDashboard
      registrations={rows}
      userName={user.displayName}
      signOutHref={adminSignOutPath("/")}
    />
  );
}
