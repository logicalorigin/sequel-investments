import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  loanType: text("loan_type").notNull(),
  propertyLocation: text("property_location"),
  propertyValue: text("property_value"),
  investmentExperience: text("investment_experience"),
  message: text("message"),
  howHeardAboutUs: text("how_heard_about_us"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  loanType: z.enum(["DSCR", "Fix & Flip", "New Construction", "Hard Money", "Both", "Other"]),
  propertyLocation: z.string().nullable().optional(),
  propertyValue: z.string().nullable().optional(),
  investmentExperience: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  howHeardAboutUs: z.string().nullable().optional(),
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
