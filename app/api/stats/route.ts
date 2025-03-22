import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getTasksByUserId, getResponsesByUserId } from '../../lib/db';

/**
 * ユーザーのタスク統計情報を取得するAPI
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // ユーザーのタスクを取得
    const tasks = await getTasksByUserId(userId);
    
    // ユーザーのビザ回答を取得
    const responses = await getResponsesByUserId(userId);
    
    // 統計データを計算
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const totalResponses = responses.length;
    const lastResponse = totalResponses > 0 ? responses[totalResponses - 1] : null;
    
    // 直近のビザ結果
    const latestVisaResult = lastResponse ? lastResponse.result : null;
    
    // 統計データをまとめる
    const stats = {
      totalTasks,
      completedTasks,
      completionRate,
      pendingTasks: totalTasks - completedTasks,
      totalVisaResponses: totalResponses,
      latestVisaResult,
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('統計情報取得エラー:', error);
    return NextResponse.json(
      { error: '統計情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}