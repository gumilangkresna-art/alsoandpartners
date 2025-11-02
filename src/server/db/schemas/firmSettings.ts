import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const firmSettings = pgTable("firm_settings", {
  id: text("id").primaryKey(),
  firmName: varchar("firm_name", { length: 255 }).default("ALSO & PARTNERS"),
  logoUrl: varchar("logo_url", { length: 500 }),
  logoType: varchar("logo_type", { length: 50 }).default("text"), // 'text' or 'image'
  logoText: varchar("logo_text", { length: 10 }).default("A&P"),
  primaryColor: varchar("primary_color", { length: 7 }).default("#1e40af"),
  secondaryColor: varchar("secondary_color", { length: 7 }).default("#dc2626"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
