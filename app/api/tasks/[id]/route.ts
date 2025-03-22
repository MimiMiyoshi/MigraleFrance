import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getTask, updateTask, deleteTask } from '@/lib/db';
import { z } from 'zod';

type TaskParams = {
  params: {
    id: string;
  };
};

export async function GET(
  request: NextRequest,
  { params }: TaskParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }
    
    const taskId = parseInt(params.id);
    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: '無効なタスクIDです' },
        { status: 400 }
      );
    }
    
    const task = await getTask(taskId);
    
    if (!task) {
      return NextResponse.json(
        { error: 'タスクが見つかりません' },
        { status: 404 }
      );
    }
    
    // 自分のタスクかどうか確認
    if (task.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'このタスクにアクセスする権限がありません' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('タスク取得エラー:', error);
    return NextResponse.json(
      { error: 'タスクの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: TaskParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }
    
    const taskId = parseInt(params.id);
    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: '無効なタスクIDです' },
        { status: 400 }
      );
    }
    
    // 更新前にタスクを取得して権限チェック
    const existingTask = await getTask(taskId);
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'タスクが見つかりません' },
        { status: 404 }
      );
    }
    
    // 自分のタスクかどうか確認
    if (existingTask.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'このタスクを更新する権限がありません' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    // 更新可能なフィールドをバリデーション
    const updateTaskSchema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      completed: z.boolean().optional(),
      dueDate: z.string().optional(),
    });
    
    const validationResult = updateTaskSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '入力データが不正です', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    // タスク更新
    const updatedTask = await updateTask(taskId, validationResult.data);
    
    if (!updatedTask) {
      return NextResponse.json(
        { error: 'タスクの更新に失敗しました' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('タスク更新エラー:', error);
    return NextResponse.json(
      { error: 'タスクの更新に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: TaskParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }
    
    const taskId = parseInt(params.id);
    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: '無効なタスクIDです' },
        { status: 400 }
      );
    }
    
    // 削除前にタスクを取得して権限チェック
    const existingTask = await getTask(taskId);
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'タスクが見つかりません' },
        { status: 404 }
      );
    }
    
    // 自分のタスクかどうか確認
    if (existingTask.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'このタスクを削除する権限がありません' },
        { status: 403 }
      );
    }
    
    // タスク削除
    const result = await deleteTask(taskId);
    
    if (!result) {
      return NextResponse.json(
        { error: 'タスクの削除に失敗しました' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('タスク削除エラー:', error);
    return NextResponse.json(
      { error: 'タスクの削除に失敗しました' },
      { status: 500 }
    );
  }
}