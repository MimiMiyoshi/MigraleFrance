import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getTasksByUserId, createTask } from '@/lib/db';
import { insertVisaTaskSchema } from '@/shared/schema';

/**
 * ユーザーのタスク一覧を取得するAPI
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
    
    const tasks = await getTasksByUserId(session.user.id);
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('タスク一覧取得エラー:', error);
    return NextResponse.json(
      { error: 'タスク一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * 新しいタスクを作成するAPI
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // ユーザーIDを追加
    const taskData = {
      ...body,
      userId: session.user.id,
      completed: false // デフォルトは未完了
    };
    
    // バリデーション
    const validationResult = insertVisaTaskSchema.safeParse(taskData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '入力データが不正です', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    // タスク作成
    const newTask = await createTask(validationResult.data);
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('タスク作成エラー:', error);
    return NextResponse.json(
      { error: 'タスクの作成に失敗しました' },
      { status: 500 }
    );
  }
}