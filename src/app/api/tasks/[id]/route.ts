import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "../../../lib/auth";
import { getTask, updateTask, deleteTask } from "../../../lib/db";
import type { VisaTask } from "../../../shared/schema";

type TaskParams = {
  params: {
    id: string;
  };
};

// 個別タスク取得API
export async function GET(request: NextRequest, { params }: TaskParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const taskId = parseInt(params.id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: "無効なタスクIDです" },
        { status: 400 }
      );
    }

    const task = await getTask(taskId);

    if (!task) {
      return NextResponse.json(
        { error: "タスクが見つかりません" },
        { status: 404 }
      );
    }

    // 所有権の確認
    if (task.userId !== session.user.id) {
      return NextResponse.json(
        { error: "このタスクにアクセスする権限がありません" },
        { status: 403 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("タスク取得エラー:", error);
    return NextResponse.json(
      { error: "タスクの取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

// タスク更新API
export async function PATCH(request: NextRequest, { params }: TaskParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const taskId = parseInt(params.id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: "無効なタスクIDです" },
        { status: 400 }
      );
    }

    const task = await getTask(taskId);

    if (!task) {
      return NextResponse.json(
        { error: "タスクが見つかりません" },
        { status: 404 }
      );
    }

    // 所有権の確認
    if (task.userId !== session.user.id) {
      return NextResponse.json(
        { error: "このタスクにアクセスする権限がありません" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // 更新可能なフィールドを定義
    const updateSchema = z.object({
      title: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      dueDate: z.string().datetime().optional(),
      completed: z.boolean().optional(),
    });

    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "入力データが無効です", details: result.error.format() },
        { status: 400 }
      );
    }

    // 更新データの型を変換
    const updateData: Partial<VisaTask> = {
      ...(result.data.title && { title: result.data.title }),
      ...(result.data.description && { description: result.data.description }),
      ...(result.data.completed !== undefined && {
        completed: result.data.completed,
      }),
      ...(result.data.dueDate && { dueDate: new Date(result.data.dueDate) }),
    };

    // タスク更新
    const updatedTask = await updateTask(taskId, updateData);

    if (!updatedTask) {
      return NextResponse.json(
        { error: "タスクの更新に失敗しました" },
        { status: 400 }
      );
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("タスク更新エラー:", error);
    return NextResponse.json(
      { error: "タスクの更新中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

// タスク削除API
export async function DELETE(request: NextRequest, { params }: TaskParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const taskId = parseInt(params.id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: "無効なタスクIDです" },
        { status: 400 }
      );
    }

    const task = await getTask(taskId);

    if (!task) {
      return NextResponse.json(
        { error: "タスクが見つかりません" },
        { status: 404 }
      );
    }

    // 所有権の確認
    if (task.userId !== session.user.id) {
      return NextResponse.json(
        { error: "このタスクにアクセスする権限がありません" },
        { status: 403 }
      );
    }

    // タスク削除
    const deleted = await deleteTask(taskId);

    if (!deleted) {
      return NextResponse.json(
        { error: "タスクの削除に失敗しました" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("タスク削除エラー:", error);
    return NextResponse.json(
      { error: "タスクの削除中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
