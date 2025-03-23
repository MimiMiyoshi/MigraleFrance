import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getTasksByUserId, getResponsesByUserId } from '@/lib/db';

/**
 * ユーザーのタスク統計情報を取得するAPI
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }
    
    // ユーザーのタスクを取得
    const tasks = await getTasksByUserId(session.user.id);
    
    // タスク統計を計算
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    let completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    completionRate = Math.round(completionRate * 10) / 10; // 小数点第一位まで表示
    
    // 今日の日付から期限切れタスクを計算
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdueTasks = tasks.filter(task => {
      if (!task.dueDate || task.completed) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate < today;
    }).length;
    
    // ビザ回答履歴を取得
    const responses = await getResponsesByUserId(session.user.id);
    const visaResponseCount = responses.length;
    
    // 今日期限のタスク
    const todayTasks = tasks.filter(task => {
      if (!task.dueDate || task.completed) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate.getDate() === today.getDate() && 
             dueDate.getMonth() === today.getMonth() && 
             dueDate.getFullYear() === today.getFullYear();
    }).length;
    
    // 統計情報を返す
    return NextResponse.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      todayTasks,
      completionRate,
      visaResponseCount,
    });
  } catch (error) {
    console.error('統計情報取得エラー:', error);
    return NextResponse.json(
      { error: '統計情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}