import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  json,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Database table definitions
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "user"] }).default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const visaTasks = pgTable("visa_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const visaResponses = pgTable("visa_responses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  taskId: integer("task_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "user"]).optional(),
});

export const insertVisaTaskSchema = createInsertSchema(visaTasks, {
  userId: z.number(),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

export const insertVisaResponseSchema = createInsertSchema(visaResponses, {
  userId: z.number(),
  taskId: z.number(),
  content: z.string(),
});

// Type definitions using Drizzle's type inference
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type VisaTask = typeof visaTasks.$inferSelect;
export type InsertVisaTask = typeof visaTasks.$inferInsert;

export type VisaResponse = typeof visaResponses.$inferSelect;
export type InsertVisaResponse = typeof visaResponses.$inferInsert;
