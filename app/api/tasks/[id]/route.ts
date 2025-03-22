import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getTask, updateTask, deleteTask } from '../../../lib/db';

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
    
    if (!session) {
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
    
    // 他のユーザーのタスクへのアクセスを防止
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
      { error: 'タスクの取得中にエラーが発生しました' },
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
    
    if (!session) {
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
    
    // 既存のタスクを取得
    const existingTask = await getTask(taskId);
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'タスクが見つかりません' },
        { status: 404 }
      );
    }
    
    // 他のユーザーのタスクの更新を防止
    if (existingTask.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'このタスクの更新権限がありません' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    // ユーザーIDの変更を防止
    delete body.userId;
    delete body.id;
    
    // タスクを更新
    const updatedTask = await updateTask(taskId, body);
    
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
      { error: 'タスクの更新中にエラーが発生しました' },
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
    
    if (!session) {
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
    
    // 既存のタスクを取得
    const existingTask = await getTask(taskId);
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'タスクが見つかりません' },
        { status: 404 }
      );
    }
    
    // 他のユーザーのタスクの削除を防止
    if (existingTask.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'このタスクの削除権限がありません' },
        { status: 403 }
      );
    }
    
    // タスクを削除
    const success = await deleteTask(taskId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'タスクの削除に失敗しました' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('タスク削除エラー:', error);
    return NextResponse.json(
      { error: 'タスクの削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}