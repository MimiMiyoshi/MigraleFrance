import { InferModel } from "drizzle-orm";
import {
  users,
  visaTypes,
  visaApplications,
  documents,
  tasks,
} from "../drizzle/schema";

// テーブルの型定義
export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, "insert">;

export type VisaType = InferModel<typeof visaTypes>;
export type NewVisaType = InferModel<typeof visaTypes, "insert">;

export type VisaApplication = InferModel<typeof visaApplications>;
export type NewVisaApplication = InferModel<typeof visaApplications, "insert">;

export type Document = InferModel<typeof documents>;
export type NewDocument = InferModel<typeof documents, "insert">;

export type Task = InferModel<typeof tasks>;
export type NewTask = InferModel<typeof tasks, "insert">;

// ステータスの型定義
export type VisaApplicationStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "approved"
  | "rejected";
export type DocumentStatus = "pending" | "uploaded" | "verified" | "rejected";
export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";
