import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
});

export const visaTasks = pgTable("visa_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false),
  dueDate: text("due_date"),
});

export const insertVisaTaskSchema = createInsertSchema(visaTasks).pick({
  userId: true,
  title: true,
  description: true,
  dueDate: true,
});

export const visaResponses = pgTable("visa_responses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  responses: json("responses").notNull(),
  result: text("result"),
  createdAt: text("created_at").notNull(),
});

export const insertVisaResponseSchema = createInsertSchema(visaResponses).pick({
  userId: true,
  responses: true,
  result: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type VisaTask = typeof visaTasks.$inferSelect;
export type InsertVisaTask = z.infer<typeof insertVisaTaskSchema>;
export type VisaResponse = typeof visaResponses.$inferSelect;
export type InsertVisaResponse = z.infer<typeof insertVisaResponseSchema>;
