import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../auth/[...nextauth]/route';
import { getTasksByUserId, createTask } from '../../lib/db';

/**
 * ユーザーのタスク一覧を取得するAPI
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
    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);

    // 認証されていない場合
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // リクエストボディの解析
    const body = await request.json();
    
    // バリデーションスキーマ
    const taskSchema = z.object({
      title: z.string().min(1, 'タイトルは必須です'),
      description: z.string().optional(),
      dueDate: z.string().optional(),
    });
    
    // バリデーション
    const validationResult = taskSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: '入力内容に問題があります', 
          details: validationResult.error.errors 
        }, 
        { status: 400 }
      );
    }

    const { title, description, dueDate } = validationResult.data;

    // タスクの作成
    const task = await createTask({
      userId: session.user.id,
      title,
      description,
      dueDate
    });
    
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('タスク作成エラー:', error);
    return NextResponse.json(
      { error: 'タスクの作成に失敗しました' },
      { status: 500 }
    );
  }
}