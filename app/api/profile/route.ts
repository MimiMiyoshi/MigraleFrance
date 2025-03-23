import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "../auth/[...nextauth]/route";
import { getUser, updateUser } from "@lib/db";

// プロフィール取得API
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const userId = session.user.id;
    const user = await getUser(userId);

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    // セキュリティのためパスワードは除外
    const { password, ...profile } = user;

    return NextResponse.json(profile);
  } catch (error) {
    console.error("プロフィール取得エラー:", error);
    return NextResponse.json(
      { error: "プロフィールの取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

// プロフィール更新API
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // 更新対象のフィールドを制限する
    const updateSchema = z.object({
      email: z
        .string()
        .email("有効なメールアドレスを入力してください")
        .optional(),
      // 必要に応じて他の更新可能フィールドを追加
    });

    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "入力データが無効です", details: result.error.format() },
        { status: 400 }
      );
    }

    // ユーザー更新
    const updatedUser = await updateUser(userId, result.data);

    if (!updatedUser) {
      return NextResponse.json(
        { error: "プロフィール更新に失敗しました" },
        { status: 400 }
      );
    }

    // パスワードは除外
    const { password, ...updatedProfile } = updatedUser;

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("プロフィール更新エラー:", error);
    return NextResponse.json(
      { error: "プロフィールの更新中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
