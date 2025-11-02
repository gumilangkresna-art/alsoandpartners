import { pgTable, text, varchar, timestamp, boolean, numeric } from "drizzle-orm/pg-core";

export const financialTransactions = pgTable("financial_transactions", {
  id: text("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // 'income' | 'expense'
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  transactionDate: timestamp("transaction_date").notNull(),
  createdBy: text("created_by"),
  isConfidential: boolean("is_confidential").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
