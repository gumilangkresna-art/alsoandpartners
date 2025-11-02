import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const courtSchedules = pgTable("court_schedules", {
  id: text("id").primaryKey(),
  caseId: text("case_id"),
  scheduleDate: timestamp("schedule_date").notNull(),
  location: varchar("location", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});
