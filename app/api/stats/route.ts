import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getTasksByUserId, getResponsesByUserId } from '../../lib/db';

/**
 * ユーザーのタスク統計情報を取得するAPI
 */
export async function GET(request: NextRequest) {
  try {
    // セッションの取得
    const session = await getServerSession(authOptions);

    // 未認証の場合は401エラー
    if (!session) {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 });
    }

    // タスク一覧の取得
    const tasks = await getTasksByUserId(Number(session.user.id));
    
    // ビザ回答一覧の取得
    const responses = await getResponsesByUserId(Number(session.user.id));
    
    // 統計情報の計算
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const pendingTasks = totalTasks - completedTasks;
    
    // 期限切れタスクの計算
    const now = new Date();
    const overdueTasks = tasks.filter(task => {
      if (!task.dueDate || task.completed) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate < now;
    }).length;
    
    // ビザタイプごとの回答数
    const responsesByVisaType = {};
    responses.forEach(response => {
      const visaType = response.result;
      responsesByVisaType[visaType] = (responsesByVisaType[visaType] || 0) + 1;
    });
    
    return NextResponse.json({
      taskStats: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        overdue: overdueTasks,
        completionRate,
      },
      visaStats: {
        totalResponses: responses.length,
        responsesByType: responsesByVisaType,
        latestResponse: responses.length > 0 ? responses[responses.length - 1] : null,
      }
    });
  } catch (error) {
    console.error('統計情報取得エラー:', error);
    return NextResponse.json(
      { message: '統計情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}