import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateAndHashPassword } from "@utils/auth";
import { createUser, getUserByUsername, getUserByEmail } from "@lib/db";

// 登録用バリデーションスキーマ
const registerSchema = z.object({
  username: z.string().min(3, "ユーザー名は3文字以上必要です").max(50),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上必要です"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // リクエストデータをバリデーション
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "入力データが無効です", details: result.error.format() },
        { status: 400 }
      );
    }

    const { username, email, password } = result.data;

    // 既存ユーザーのチェック
    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      return NextResponse.json(
        { error: "このユーザー名は既に使用されています" },
        { status: 400 }
      );
    }

    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 400 }
      );
    }

    // パスワードのハッシュ化
    const hashedPassword = await validateAndHashPassword(password);

    // ユーザーの作成
    const newUser = await createUser({
      username,
      email,
      password: hashedPassword,
      role: "user", // デフォルトロール
    });

    // パスワードを除外したユーザー情報を返す
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("ユーザー登録エラー:", error);
    return NextResponse.json(
      { error: "ユーザー登録中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
