import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, getUserByEmail, createUser } from '@/lib/db';
import { insertUserSchema } from '@/shared/schema';
import { hashPassword } from '@/utils/auth';
import { z } from 'zod';

// 登録用のスキーマ拡張（パスワード確認フィールド追加）
const registerSchema = insertUserSchema.extend({
  passwordConfirm: z.string().min(6, 'パスワード確認は6文字以上である必要があります'),
}).refine(data => data.password === data.passwordConfirm, {
  message: 'パスワードが一致しません',
  path: ['passwordConfirm'],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '入力データが不正です', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { username, email, password } = validationResult.data;
    
    // ユーザー名が既に存在するか確認
    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      return NextResponse.json(
        { error: 'このユーザー名は既に使用されています' },
        { status: 400 }
      );
    }
    
    // メールアドレスが既に存在するか確認
    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      );
    }
    
    // パスワードハッシュ化
    const hashedPassword = await hashPassword(password);
    
    // ユーザー作成
    const newUser = await createUser({
      username,
      email,
      password: hashedPassword,
      role: 'user', // デフォルトロール
    });
    
    // パスワードを除外して返す
    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    return NextResponse.json(
      { error: 'ユーザー登録に失敗しました' },
      { status: 500 }
    );
  }
}