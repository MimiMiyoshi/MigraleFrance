import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { getTasksByUserId, getResponsesByUserId, getStats } from "@lib/db";

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

    // 最新のビザ回答
    const latestResponse =
      responses.length > 0
        ? responses.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0]
        : null;

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
        latestResult: latestResponse ? latestResponse.result : null,
        latestResponseDate: latestResponse ? latestResponse.createdAt : null,
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
