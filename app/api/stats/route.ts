import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import * as db from "@/app/lib/db";

// ユーザーの統計情報を取得
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
    
    // タスクの統計を取得
    const tasks = await db.getTasksByUserId(userId);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const incompleteTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // ビザ回答の統計を取得
    const responses = await db.getResponsesByUserId(userId);
    const totalResponses = responses.length;
    const latestResponse = responses.length > 0 
      ? responses.reduce((latest, current) => {
          return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
        })
      : null;
    
    // 統計データを返す
    return NextResponse.json({
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        incomplete: incompleteTasks,
        completionRate: completionRate.toFixed(1),
      },
      visaResponses: {
        total: totalResponses,
        latestResult: latestResponse?.result || null,
        latestResponseDate: latestResponse?.createdAt || null,
      }
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { message: "統計情報の取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}