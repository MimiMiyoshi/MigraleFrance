import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getTask, updateTask, deleteTask } from '../../../lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // セッションの取得
    const session = await getServerSession(authOptions);

    // 未認証の場合は401エラー
    if (!session) {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 });
    }

    const taskId = Number(params.id);
    
    // タスクの取得
    const task = await getTask(taskId);
    
    // タスクが見つからない場合は404エラー
    if (!task) {
      return NextResponse.json({ message: 'タスクが見つかりません' }, { status: 404 });
    }
    
    // 他のユーザーのタスクへのアクセスを防止
    if (task.userId !== Number(session.user.id)) {
      return NextResponse.json({ message: 'アクセス権限がありません' }, { status: 403 });
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('タスク取得エラー:', error);
    return NextResponse.json(
      { message: 'タスクの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // セッションの取得
    const session = await getServerSession(authOptions);

    // 未認証の場合は401エラー
    if (!session) {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 });
    }

    const taskId = Number(params.id);
    
    // タスクの取得（存在確認と所有者チェックのため）
    const existingTask = await getTask(taskId);
    
    // タスクが見つからない場合は404エラー
    if (!existingTask) {
      return NextResponse.json({ message: 'タスクが見つかりません' }, { status: 404 });
    }
    
    // 他のユーザーのタスクへのアクセスを防止
    if (existingTask.userId !== Number(session.user.id)) {
      return NextResponse.json({ message: 'アクセス権限がありません' }, { status: 403 });
    }
    
    // リクエストボディの取得
    const body = await request.json();
    
    // タスクの更新
    const updatedTask = await updateTask(taskId, body);
    
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
    // セッションの取得
    const session = await getServerSession(authOptions);

    // 未認証の場合は401エラー
    if (!session) {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 });
    }

    const taskId = Number(params.id);
    
    // タスクの取得（存在確認と所有者チェックのため）
    const existingTask = await getTask(taskId);
    
    // タスクが見つからない場合は404エラー
    if (!existingTask) {
      return NextResponse.json({ message: 'タスクが見つかりません' }, { status: 404 });
    }
    
    // 他のユーザーのタスクへのアクセスを防止
    if (existingTask.userId !== Number(session.user.id)) {
      return NextResponse.json({ message: 'アクセス権限がありません' }, { status: 403 });
    }
    
    // タスクの削除
    await deleteTask(taskId);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('タスク削除エラー:', error);
    return NextResponse.json(
      { message: 'タスクの削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}