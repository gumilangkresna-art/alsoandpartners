import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const cases = pgTable("cases", {
  id: text("id").primaryKey(),
  caseNumber: varchar("case_number", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("active"),
  assignedLawyerId: text("assigned_lawyer_id"),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  startDate: timestamp("start_date"),
  expectedEndDate: timestamp("expected_end_date"),
  actualEndDate: timestamp("actual_end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});
