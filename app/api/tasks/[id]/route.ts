import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import * as db from '@/app/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);
    
    // 未認証の場合は401エラー
    if (!session || !session.user) {
      return new NextResponse(null, { status: 401 });
    }
    
    // タスクIDを数値に変換
    const taskId = parseInt(params.id);
    if (isNaN(taskId)) {
      return NextResponse.json(
        { message: '無効なタスクIDです' },
        { status: 400 }
      );
    }
    
    // タスクを取得
    const task = await db.getTask(taskId);
    
    // タスクが存在しない場合は404エラー
    if (!task) {
      return NextResponse.json(
        { message: 'タスクが見つかりません' },
        { status: 404 }
      );
    }
    
    // 他のユーザーのタスクは閲覧不可
    if (task.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'このタスクにアクセスする権限がありません' },
        { status: 403 }
      );
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
    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);
    
    // 未認証の場合は401エラー
    if (!session || !session.user) {
      return new NextResponse(null, { status: 401 });
    }
    
    // タスクIDを数値に変換
    const taskId = parseInt(params.id);
    if (isNaN(taskId)) {
      return NextResponse.json(
        { message: '無効なタスクIDです' },
        { status: 400 }
      );
    }
    
    // 既存のタスクを取得
    const existingTask = await db.getTask(taskId);
    
    // タスクが存在しない場合は404エラー
    if (!existingTask) {
      return NextResponse.json(
        { message: 'タスクが見つかりません' },
        { status: 404 }
      );
    }
    
    // 他のユーザーのタスクは編集不可
    if (existingTask.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'このタスクを編集する権限がありません' },
        { status: 403 }
      );
    }
    
    // リクエストのボディを取得
    const body = await request.json();
    
    // 更新データの作成（undefined値は除外）
    const updateData: any = {};
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate;
    if (body.completed !== undefined) updateData.completed = body.completed;
    
    // タスクを更新
    const updatedTask = await db.updateTask(taskId, updateData);
    
    if (!updatedTask) {
      return NextResponse.json(
        { message: 'タスクの更新に失敗しました' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedTask);
  } catch (error: any) {
    console.error('タスク更新エラー:', error);
    return NextResponse.json(
      { message: error.message || 'タスクの更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);
    
    // 未認証の場合は401エラー
    if (!session || !session.user) {
      return new NextResponse(null, { status: 401 });
    }
    
    // タスクIDを数値に変換
    const taskId = parseInt(params.id);
    if (isNaN(taskId)) {
      return NextResponse.json(
        { message: '無効なタスクIDです' },
        { status: 400 }
      );
    }
    
    // 既存のタスクを取得
    const existingTask = await db.getTask(taskId);
    
    // タスクが存在しない場合は404エラー
    if (!existingTask) {
      return NextResponse.json(
        { message: 'タスクが見つかりません' },
        { status: 404 }
      );
    }
    
    // 他のユーザーのタスクは削除不可
    if (existingTask.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'このタスクを削除する権限がありません' },
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