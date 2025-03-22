import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import * as db from '@/app/lib/db';

export async function GET(request: NextRequest) {
  try {
    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);
    
    // 未認証の場合は401エラー
    if (!session || !session.user) {
      return new NextResponse(null, { status: 401 });
    }
    
    // ユーザーIDに関連するタスクを取得
    const tasks = await db.getTasksByUserId(session.user.id);
    
    // タスクの統計情報を計算
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;
    
    // ユーザーIDに関連するビザ回答を取得
    const responses = await db.getResponsesByUserId(session.user.id);
    
    // 統計情報をまとめる
    const stats = {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: totalTasks - completedTasks,
        completionRate: completionRate
      },
      visaResponses: {
        total: responses.length,
        latest: responses.length > 0 ? responses[0] : null
      }
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('統計情報取得エラー:', error);
    return NextResponse.json(
      { message: '統計情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}