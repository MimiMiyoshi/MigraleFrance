import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  json,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ユーザーテーブル
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ビザ種別テーブル
export const visaTypes = pgTable("visa_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").unique().notNull(),
  description: text("description"),
  requirements: json("requirements"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ビザ申請テーブル
export const visaApplications = pgTable("visa_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  visaTypeId: integer("visa_type_id")
    .references(() => visaTypes.id)
    .notNull(),
  status: text("status").notNull().default("draft"), // draft, submitted, in_review, approved, rejected
  submissionDate: timestamp("submission_date"),
  plannedArrivalDate: timestamp("planned_arrival_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 必要書類テーブル
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  visaApplicationId: integer("visa_application_id")
    .references(() => visaApplications.id)
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  required: boolean("required").default(true).notNull(),
  status: text("status").notNull().default("pending"), // pending, uploaded, verified, rejected
  fileUrl: text("file_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// タスクテーブル
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  visaApplicationId: integer("visa_application_id")
    .references(() => visaApplications.id)
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed
  priority: text("priority").notNull().default("medium"), // low, medium, high
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// リレーションの定義
export const usersRelations = relations(users, ({ many }) => ({
  visaApplications: many(visaApplications),
}));

export const visaApplicationsRelations = relations(
  visaApplications,
  ({ one, many }) => ({
    user: one(users, {
      fields: [visaApplications.userId],
      references: [users.id],
    }),
    visaType: one(visaTypes, {
      fields: [visaApplications.visaTypeId],
      references: [visaTypes.id],
    }),
    documents: many(documents),
    tasks: many(tasks),
  })
);

export const documentsRelations = relations(documents, ({ one }) => ({
  visaApplication: one(visaApplications, {
    fields: [documents.visaApplicationId],
    references: [visaApplications.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  visaApplication: one(visaApplications, {
    fields: [tasks.visaApplicationId],
    references: [visaApplications.id],
  }),
}));
