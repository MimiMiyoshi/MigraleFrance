import { NextRequest, NextResponse } from 'next/server';
import { insertUserSchema } from '@/shared/schema';
import { hashPassword } from '@/app/utils/auth';
import * as db from '@/app/lib/db';

export async function POST(request: NextRequest) {
  try {
    // リクエストボディからユーザーデータを取得
    const body = await request.json();
    
    // 入力データを検証
    const result = insertUserSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: '入力データが不正です', errors: result.error.format() },
        { status: 400 }
      );
    }
    
    // ユーザー名とメールアドレスの重複チェック
    const existingUsername = await db.getUserByUsername(body.username);
    if (existingUsername) {
      return NextResponse.json(
        { message: 'このユーザー名はすでに使用されています' },
        { status: 400 }
      );
    }
    
    const existingEmail = await db.getUserByEmail(body.email);
    if (existingEmail) {
      return NextResponse.json(
        { message: 'このメールアドレスはすでに登録されています' },
        { status: 400 }
      );
    }
    
    // パスワードをハッシュ化
    const hashedPassword = await hashPassword(body.password);
    
    // ユーザーを作成
    const userData = {
      username: body.username,
      email: body.email,
      password: hashedPassword
    };
    
    const user = await db.createUser(userData);
    
    // パスワードを除外してレスポンスを返す
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