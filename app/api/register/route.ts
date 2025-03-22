import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword } from '@/utils/auth';
import { createUser, getUserByEmail, getUserByUsername } from '@/lib/db';
import { insertUserSchema } from '@/shared/schema';

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
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
    
    const data = validationResult.data;
    
    // ユーザー名が既に存在するか確認
    const existingUsername = await getUserByUsername(data.username);
    if (existingUsername) {
      return NextResponse.json(
        { error: 'このユーザー名は既に使用されています' },
        { status: 400 }
      );
    }
    
    // メールアドレスが既に存在するか確認
    const existingEmail = await getUserByEmail(data.email);
    if (existingEmail) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      );
    }
    
    // パスワードハッシュ化
    const hashedPassword = await hashPassword(data.password);
    
    // ユーザー作成
    const newUser = await createUser({
      username: data.username,
      email: data.email,
      password: hashedPassword,
    });
    
    // パスワードを除いてユーザー情報を返す
    const { password, ...userWithoutPassword } = newUser;
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    return NextResponse.json(
      { error: 'ユーザー登録に失敗しました' },
      { status: 500 }
    );
  }
}