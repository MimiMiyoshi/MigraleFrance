import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import * as db from '@/app/lib/db';
import { z } from 'zod';

// タスク更新スキーマ
const updateTaskSchema = z.object({
  title: z.string().min(1, { message: 'タイトルは必須です' }).optional(),
  description: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  completed: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(null, { status: 401 });
    }
    
    const taskId = parseInt(params.id);
    if (isNaN(taskId)) {
      return NextResponse.json(
        { message: '不正なタスクIDです' },
        { status: 400 }
      );
    }
    
    const task = await db.getTask(taskId);
    
    if (!task) {
      return NextResponse.json(
        { message: 'タスクが見つかりません' },
        { status: 404 }
      );
    }
    
    // 他のユーザーのタスクへのアクセスを防止
    if (task.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'このタスクへのアクセス権限がありません' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('タスク詳細取得エラー:', error);
    return NextResponse.json(
      { message: 'タスク詳細の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(null, { status: 401 });
    }
    
    const taskId = parseInt(params.id);
    if (isNaN(taskId)) {
      return NextResponse.json(
        { message: '不正なタスクIDです' },
        { status: 400 }
      );
    }
    
    // タスクの存在確認
    const existingTask = await db.getTask(taskId);
    
    if (!existingTask) {
      return NextResponse.json(
        { message: 'タスクが見つかりません' },
        { status: 404 }
      );
    }
    
    // 他のユーザーのタスクの更新を防止
    if (existingTask.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'このタスクの更新権限がありません' },
        { status: 403 }
      );
    }
    
    // リクエストボディからデータを取得
    const body = await request.json();
    
    // 入力データを検証
    const result = updateTaskSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: '入力データが不正です', errors: result.error.format() },
        { status: 400 }
      );
    }
    
    // タスクを更新
    const updatedTask = await db.updateTask(taskId, body);
    
    if (!updatedTask) {
      return NextResponse.json(
        { message: 'タスクの更新に失敗しました' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('タスク更新エラー:', error);
    return NextResponse.json(
      { message: 'タスクの更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(null, { status: 401 });
    }
    
    const taskId = parseInt(params.id);
    if (isNaN(taskId)) {
      return NextResponse.json(
        { message: '不正なタスクIDです' },
        { status: 400 }
      );
    }
    
    // タスクの存在確認
    const existingTask = await db.getTask(taskId);
    
    if (!existingTask) {
      return NextResponse.json(
        { message: 'タスクが見つかりません' },
        { status: 404 }
      );
    }
    
    // 他のユーザーのタスクの削除を防止
    if (existingTask.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'このタスクの削除権限がありません' },
        { status: 403 }
      );
    }
    
    // タスクを削除
    const success = await db.deleteTask(taskId);
    
    if (!success) {
      return NextResponse.json(
        { message: 'タスクの削除に失敗しました' },
        { status: 500 }
      );
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('タスク削除エラー:', error);
    return NextResponse.json(
      { message: 'タスクの削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}