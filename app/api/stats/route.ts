import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getTasksByUserId, getResponsesByUserId } from '../../lib/db';

/**
 * ユーザーのタスク統計情報を取得するAPI
 */
export async function GET(request: NextRequest) {
  try {
    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);

    // 認証されていない場合
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // ユーザーのタスク一覧を取得
    const tasks = await getTasksByUserId(session.user.id);
    
    // ユーザーのビザ回答一覧を取得
    const responses = await getResponsesByUserId(session.user.id);

    // タスクの統計情報を計算
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const incompleteTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 期限切れのタスク数を計算
    const now = new Date();
    const overdueTasksCount = tasks.filter(task => {
      if (!task.completed && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        return dueDate < now;
      }
      return false;
    }).length;

    // 今後の期限別タスク数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // 期限別に未完了タスクを分類
    const dueTodayCount = tasks.filter(task => {
      if (!task.completed && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
      }
      return false;
    }).length;

    const dueTomorrowCount = tasks.filter(task => {
      if (!task.completed && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === tomorrow.getTime();
      }
      return false;
    }).length;

    const dueThisWeekCount = tasks.filter(task => {
      if (!task.completed && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= today && dueDate < nextWeek;
      }
      return false;
    }).length;

    const dueThisMonthCount = tasks.filter(task => {
      if (!task.completed && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= today && dueDate < nextMonth;
      }
      return false;
    }).length;

    // 最近のビザ結果
    const latestResponse = responses.length > 0 ? responses[0] : null;
    const latestResult = latestResponse ? latestResponse.result : null;

    // 統計情報をまとめる
    const stats = {
      tasksStats: {
        total: totalTasks,
        completed: completedTasks,
        incomplete: incompleteTasks,
        overdue: overdueTasksCount,
        completionRate,
        dueToday: dueTodayCount,
        dueTomorrow: dueTomorrowCount,
        dueThisWeek: dueThisWeekCount,
        dueThisMonth: dueThisMonthCount
      },
      visaStats: {
        totalResponses: responses.length,
        latestResult
      }
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('統計情報取得エラー:', error);
    return NextResponse.json(
      { error: '統計情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}