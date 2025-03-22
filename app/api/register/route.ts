import { NextRequest, NextResponse } from 'next/server';
import { insertUserSchema } from '../../shared/schema';
import { hashPassword } from '../../utils/auth';
import { createUser, getUserByEmail, getUserByUsername } from '../../lib/db';

export async function POST(request: NextRequest) {
  try {
    // リクエストボディの取得
    const body = await request.json();

    // バリデーション
    const result = insertUserSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: '無効なユーザーデータです', errors: result.error.errors },
        { status: 400 }
      );
    }

    // ユーザー名とメールの重複チェック
    const existingUsername = await getUserByUsername(body.username);
    if (existingUsername) {
      return NextResponse.json(
        { message: 'このユーザー名は既に使用されています' },
        { status: 400 }
      );
    }

    const existingEmail = await getUserByEmail(body.email);
    if (existingEmail) {
      return NextResponse.json(
        { message: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      );
    }

    // パスワードのハッシュ化
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