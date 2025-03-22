import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserByUsername, getUserByEmail, createUser } from '../../lib/db';
import { hashPassword } from '../../utils/auth';

// ユーザー登録スキーマ
const registerSchema = z.object({
  username: z.string().min(3, { message: 'ユーザー名は3文字以上である必要があります' }),
  email: z.string().email({ message: '有効なメールアドレスを入力してください' }),
  password: z.string().min(8, { message: 'パスワードは8文字以上である必要があります' }),
});

export async function POST(request: NextRequest) {
  try {
    // リクエストボディの取得
    const body = await request.json();

    // バリデーション
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: '入力内容に問題があります', errors: result.error.errors },
        { status: 400 }
      );
    }

    // 既存ユーザーのチェック（ユーザー名）
    const existingUsername = await getUserByUsername(body.username);
    if (existingUsername) {
      return NextResponse.json(
        { message: 'このユーザー名は既に使用されています' },
        { status: 400 }
      );
    }

    // 既存ユーザーのチェック（メールアドレス）
    const existingEmail = await getUserByEmail(body.email);
    if (existingEmail) {
      return NextResponse.json(
        { message: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      );
    }

    // パスワードをハッシュ化
    const hashedPassword = await hashPassword(body.password);

    // ユーザーの作成
    const user = await createUser({
      ...body,
      password: hashedPassword,
    });

    // パスワードを除外して返す
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    return NextResponse.json(
      { message: 'ユーザー登録中にエラーが発生しました' },
      { status: 500 }
    );
  }
}