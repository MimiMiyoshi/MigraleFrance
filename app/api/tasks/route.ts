import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { authOptions } from '../auth/[...nextauth]/route';
import { getTasksByUserId, createTask } from '@/lib/db';
import { insertVisaTaskSchema } from '@/shared/schema';

/**
 * ユーザーのタスク一覧を取得するAPI
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
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
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body = await request.json();
    
    // タスク作成スキーマを拡張してバリデーション
    const taskSchema = insertVisaTaskSchema.extend({
      title: z.string().min(1, 'タイトルは必須です').max(255),
      description: z.string().min(1, '説明は必須です'),
      dueDate: z.string().optional(),
    });
    
    const result = taskSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: '入力データが無効です', details: result.error.format() },
        { status: 400 }
      );
    }
    
    // タスク作成
    const newTask = await createTask({
      ...result.data,
      userId,
      completed: false,
    });
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('タスク作成エラー:', error);
    return NextResponse.json(
      { error: 'タスクの作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}