import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import * as db from "@/app/lib/db";
import { insertVisaTaskSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// タスク一覧を取得
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json(
      { message: "認証されていません" }, 
      { status: 401 }
    );
  }
  
  try {
    const userId = parseInt(session.user.id);
    const tasks = await db.getTasksByUserId(userId);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Tasks fetch error:", error);
    return NextResponse.json(
      { message: "タスクの取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

// 新しいタスクを作成
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json(
      { message: "認証されていません" }, 
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    const userId = parseInt(session.user.id);
    
    // リクエストデータをバリデーション
    const taskData = insertVisaTaskSchema.parse({
      ...body,
      userId // セッションからユーザーIDを追加
    });
    
    const newTask = await db.createTask(taskData);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return NextResponse.json(
        { message: validationError.message },
        { status: 400 }
      );
    }
    
    console.error("Task creation error:", error);
    return NextResponse.json(
      { message: "タスクの作成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}