import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getTasksByUserId, createTask } from '../../lib/db';
import { insertVisaTaskSchema } from '../../shared/schema';

/**
 * ユーザーのタスク一覧を取得するAPI
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
    const tasks = await getTasksByUserId(userId);
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('タスク一覧取得エラー:', error);
    return NextResponse.json(
      { error: 'タスク一覧の取得中にエラーが発生しました' },
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
    
    if (!session) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body = await request.json();
    
    // ユーザーIDをリクエストボディにセット
    const taskData = { ...body, userId };
    
    // バリデーション
    const validationResult = insertVisaTaskSchema.safeParse(taskData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '無効な入力データです', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    // タスクの作成
    const newTask = await createTask(validationResult.data);
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('タスク作成エラー:', error);
    return NextResponse.json(
      { error: 'タスクの作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}