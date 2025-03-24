import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import { getTasksByUserId, getResponsesByUserId } from "../../lib/db";
import { VisaResponse } from "../../shared/schema";

/**
 * ユーザーのタスク統計情報を取得するAPI
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const userId = session.user.id;

    // ユーザーのタスク一覧を取得
    const tasks = await getTasksByUserId(userId);

    // ビザ回答を取得
    const responses = await getResponsesByUserId(userId);

    // 統計情報の計算
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 期限切れのタスク数
    const today = new Date();
    const overdueTasks = tasks.filter((task) => {
      if (!task.dueDate || task.completed) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate < today;
    }).length;

    // 直近7日間に期限が到来するタスク
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    const upcomingTasks = tasks.filter((task) => {
      if (!task.dueDate || task.completed) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate <= nextWeek;
    }).length;

    // 回答済みビザクエスチョネア数
    const visaResponsesCount = responses.length;

    // 最新のビザ回答を取得
    const sortedResponses = [...responses].sort(
      (a: VisaResponse, b: VisaResponse) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      }
    );
    const latestResponse =
      sortedResponses.length > 0 ? sortedResponses[0] : null;

    // 統計情報をまとめる
    const stats = {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        completionRate,
        overdue: overdueTasks,
        upcoming: upcomingTasks,
      },
      visa: {
        responsesCount: visaResponsesCount,
        latestContent: latestResponse?.content ?? null,
        latestResponseDate: latestResponse?.createdAt ?? null,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("統計情報取得エラー:", error);
    return NextResponse.json(
      { error: "統計情報の取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
