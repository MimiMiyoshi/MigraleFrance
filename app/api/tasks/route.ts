import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "../../lib/auth";
import { storage } from "@/lib/storage";
import { insertVisaTaskSchema } from "@/shared/schema";

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
    const taskData = insertVisaTaskSchema.parse({ ...body, userId });
    const task = await storage.createTask(taskData);
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
