import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "../../lib/auth";
import { storage } from "@/lib/storage";
import { insertVisaTaskSchema } from "@/shared/schema";
import type { InsertVisaTask } from "@/shared/schema";

/**
 * ユーザーのタスク一覧を取得するAPI
 */
export async function GET() {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;
  const tasks = await storage.getTasksByUserId(userId);
  return NextResponse.json(tasks);
}

/**
 * 新しいタスクを作成するAPI
 */
export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const userId = session.user.id;
    const validatedData = insertVisaTaskSchema.parse({ ...body, userId });

    // データを適切な型に変換
    const taskData: InsertVisaTask = {
      userId: validatedData.userId,
      title: validatedData.title,
      description: validatedData.description || null,
      completed: false,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
    };

    const task = await storage.createTask(taskData);
    return NextResponse.json(task);
  } catch (error) {
    console.error("タスク作成エラー:", error);
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
