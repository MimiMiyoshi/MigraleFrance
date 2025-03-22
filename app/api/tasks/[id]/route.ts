import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import * as db from "@/app/lib/db";
import { VisaTask } from "@shared/schema";

// 特定のタスクを取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json(
      { message: "認証されていません" }, 
      { status: 401 }
    );
  }
  
  try {
    const taskId = parseInt(params.id);
    const task = await db.getTask(taskId);
    
    if (!task) {
      return NextResponse.json(
        { message: "タスクが見つかりません" },
        { status: 404 }
      );
    }
    
    // 他のユーザーのタスクにアクセスさせない
    const userId = parseInt(session.user.id);
    if (task.userId !== userId) {
      return NextResponse.json(
        { message: "このタスクへのアクセス権限がありません" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error("Task fetch error:", error);
    return NextResponse.json(
      { message: "タスクの取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

// タスクを更新
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json(
      { message: "認証されていません" }, 
      { status: 401 }
    );
  }
  
  try {
    const taskId = parseInt(params.id);
    const body = await request.json();
    
    // 既存のタスクを取得
    const existingTask = await db.getTask(taskId);
    
    if (!existingTask) {
      return NextResponse.json(
        { message: "タスクが見つかりません" },
        { status: 404 }
      );
    }
    
    // 他のユーザーのタスクを更新させない
    const userId = parseInt(session.user.id);
    if (existingTask.userId !== userId) {
      return NextResponse.json(
        { message: "このタスクへのアクセス権限がありません" },
        { status: 403 }
      );
    }
    
    // 更新内容から不正なプロパティを取り除く
    const { id, userId: _, ...allowedUpdates } = body as Partial<VisaTask>;
    
    // タスクを更新
    const updatedTask = await db.updateTask(taskId, allowedUpdates);
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Task update error:", error);
    return NextResponse.json(
      { message: "タスクの更新中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

// タスクを削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json(
      { message: "認証されていません" }, 
      { status: 401 }
    );
  }
  
  try {
    const taskId = parseInt(params.id);
    
    // 既存のタスクを取得
    const existingTask = await db.getTask(taskId);
    
    if (!existingTask) {
      return NextResponse.json(
        { message: "タスクが見つかりません" },
        { status: 404 }
      );
    }
    
    // 他のユーザーのタスクを削除させない
    const userId = parseInt(session.user.id);
    if (existingTask.userId !== userId) {
      return NextResponse.json(
        { message: "このタスクへのアクセス権限がありません" },
        { status: 403 }
      );
    }
    
    // タスクを削除
    const success = await db.deleteTask(taskId);
    
    if (!success) {
      return NextResponse.json(
        { message: "タスクの削除に失敗しました" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: "タスクが正常に削除されました" }
    );
  } catch (error) {
    console.error("Task deletion error:", error);
    return NextResponse.json(
      { message: "タスクの削除中にエラーが発生しました" },
      { status: 500 }
    );
  }
}