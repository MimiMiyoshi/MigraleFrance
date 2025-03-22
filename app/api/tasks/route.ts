import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import * as db from '@/app/lib/db';
import { InsertVisaTask } from '../../../shared/schema';

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
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('タスク一覧取得エラー:', error);
    return NextResponse.json(
      { message: 'タスク一覧の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);
    
    // 未認証の場合は401エラー
    if (!session || !session.user) {
      return new NextResponse(null, { status: 401 });
    }
    
    // リクエストのボディを取得
    const body = await request.json();
    
    // 必須フィールドの確認
    if (!body.title) {
      return NextResponse.json(
        { message: 'タイトルは必須です' },
        { status: 400 }
      );
    }
    
    // タスクデータの作成
    const taskData: InsertVisaTask = {
      userId: session.user.id,
      title: body.title,
      description: body.description || '',
      dueDate: body.dueDate || null,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    
    // タスクを作成
    const newTask = await db.createTask(taskData);
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error: any) {
    console.error('タスク作成エラー:', error);
    return NextResponse.json(
      { message: error.message || 'タスクの作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}