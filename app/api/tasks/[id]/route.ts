import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getTask, updateTask, deleteTask } from '../../../lib/db';

// タスクIDとユーザーIDをパラメータとして取得するための型
type TaskParams = {
  params: {
    id: string;
  };
};

// 特定のタスクを取得するAPI
export async function GET(
  request: NextRequest,
  { params }: TaskParams
) {
  try {
    // タスクIDの取得
    const taskId = parseInt(params.id);
    
    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: '無効なタスクIDです' },
        { status: 400 }
      );
    }

    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);

    // 認証されていない場合
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // タスクの取得
    const task = await getTask(taskId);
    
    if (!task) {
      return NextResponse.json(
        { error: 'タスクが見つかりません' },
        { status: 404 }
      );
    }

    // タスクのユーザーIDとログインユーザーIDが一致するか確認
    if (task.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'このタスクへのアクセス権がありません' },
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

// タスクを更新するAPI
export async function PATCH(
  request: NextRequest,
  { params }: TaskParams
) {
  try {
    // タスクIDの取得
    const taskId = parseInt(params.id);
    
    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: '無効なタスクIDです' },
        { status: 400 }
      );
    }

    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);

    // 認証されていない場合
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // タスクの取得
    const existingTask = await getTask(taskId);
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'タスクが見つかりません' },
        { status: 404 }
      );
    }

    // タスクのユーザーIDとログインユーザーIDが一致するか確認
    if (existingTask.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'このタスクへのアクセス権がありません' },
        { status: 403 }
      );
    }

    // リクエストボディの解析
    const body = await request.json();
    
    // バリデーションスキーマ
    const taskUpdateSchema = z.object({
      title: z.string().min(1, 'タイトルは必須です').optional(),
      description: z.string().optional(),
      dueDate: z.string().optional(),
      completed: z.boolean().optional(),
    });
    
    // バリデーション
    const validationResult = taskUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: '入力内容に問題があります', 
          details: validationResult.error.errors 
        }, 
        { status: 400 }
      );
    }

    // タスクの更新
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

// タスクを削除するAPI
export async function DELETE(
  request: NextRequest,
  { params }: TaskParams
) {
  try {
    // タスクIDの取得
    const taskId = parseInt(params.id);
    
    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: '無効なタスクIDです' },
        { status: 400 }
      );
    }

    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);

    // 認証されていない場合
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // タスクの取得
    const existingTask = await getTask(taskId);
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'タスクが見つかりません' },
        { status: 404 }
      );
    }

    // タスクのユーザーIDとログインユーザーIDが一致するか確認
    if (existingTask.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'このタスクへのアクセス権がありません' },
        { status: 403 }
      );
    }

    // タスクの削除
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