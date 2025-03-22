import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createUser, getUserByEmail, getUserByUsername } from '../../lib/db';
import { hashPassword } from '../../utils/auth';

// ユーザー登録リクエストのバリデーションスキーマ
const registerSchema = z.object({
  username: z.string().min(3, 'ユーザー名は3文字以上必要です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上必要です')
});

export async function POST(request: NextRequest) {
  try {
    // リクエストボディの解析
    const body = await request.json();
    
    // バリデーション
    const validationResult = registerSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: '入力内容に問題があります', 
          details: validationResult.error.errors 
        }, 
        { status: 400 }
      );
    }

    const { username, email, password } = validationResult.data;

    // ユーザー名の重複チェック
    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      return NextResponse.json(
        { error: 'このユーザー名は既に使用されています' },
        { status: 400 }
      );
    }

    // メールアドレスの重複チェック
    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      );
    }

    // パスワードのハッシュ化
    const hashedPassword = await hashPassword(password);

    // ユーザーの作成
    const user = await createUser({
      username,
      email,
      password: hashedPassword
    });

    // パスワードを除いたユーザー情報を返す
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        message: 'ユーザー登録が完了しました', 
        user: userWithoutPassword 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    return NextResponse.json(
      { error: 'ユーザー登録に失敗しました' },
      { status: 500 }
    );
  }
}