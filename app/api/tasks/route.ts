import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getTasksByUserId, createTask } from '../../lib/db';
import { insertVisaTaskSchema } from '../../shared/schema';

/**
 * ユーザーのタスク一覧を取得するAPI
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
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('タスク一覧取得エラー:', error);
    return NextResponse.json(
      { message: 'タスク一覧の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * 新しいタスクを作成するAPI
 */
export async function POST(request: NextRequest) {
  try {
    // セッションの取得
    const session = await getServerSession(authOptions);

    // 未認証の場合は401エラー
    if (!session) {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 });
    }

    // リクエストボディの取得
    const body = await request.json();

    // バリデーション
    const result = insertVisaTaskSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: '無効なタスクデータです', errors: result.error.errors },
        { status: 400 }
      );
    }

    // タスクの作成（ユーザーIDを設定）
    const task = await createTask({
      ...body,
      userId: Number(session.user.id),
      completed: false, // デフォルトで未完了
    });
    
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('タスク作成エラー:', error);
    return NextResponse.json(
      { message: 'タスクの作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}