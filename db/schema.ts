import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const registrations = sqliteTable(
  "registrations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    registrationCode: text("registration_code").notNull(),
    name: text("name").notNull(),
    title: text("title").notNull(),
    organization: text("organization").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull().default(""),
    ticketType: text("ticket_type").notNull(),
    attendDinner: integer("attend_dinner", { mode: "boolean" }).notNull().default(false),
    needHotel: integer("need_hotel", { mode: "boolean" }).notNull().default(false),
    status: text("status").notNull().default("confirmed"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("registrations_code_unique").on(table.registrationCode),
    index("registrations_created_at_idx").on(table.createdAt),
    index("registrations_email_idx").on(table.email),
  ],
);

export const siteContent = sqliteTable("site_content", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedBy: text("updated_by").notNull().default(""),
});
