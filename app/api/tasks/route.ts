import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import * as db from '@/app/lib/db';
import { insertVisaTaskSchema } from '@/shared/schema';

export async function GET(request: NextRequest) {
  try {
    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);
    
    // 未認証の場合は401エラー
    if (!session || !session.user) {
      return NextResponse.json(null, { status: 401 });
    }
    
    // ユーザーIDに関連するタスクを取得
    const tasks = await db.getTasksByUserId(session.user.id);
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('タスク取得エラー:', error);
    return NextResponse.json(
      { message: 'タスクの取得中にエラーが発生しました' },
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
      return NextResponse.json(null, { status: 401 });
    }
    
    // リクエストボディからタスクデータを取得
    const body = await request.json();
    
    // 入力データを検証
    const result = insertVisaTaskSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: '入力データが不正です', errors: result.error.format() },
        { status: 400 }
      );
    }
    
    // タスクを作成
    const taskData = {
      userId: session.user.id,
      title: body.title,
      description: body.description,
      dueDate: body.dueDate
    };
    
    const task = await db.createTask(taskData);
    
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('タスク作成エラー:', error);
    return NextResponse.json(
      { message: 'タスクの作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}