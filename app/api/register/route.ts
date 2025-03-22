import { NextRequest, NextResponse } from 'next/server';
import { insertUserSchema } from '../../shared/schema';
import { createUser, getUserByEmail, getUserByUsername } from '../../lib/db';
import { hashPassword } from '../../utils/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    const validationResult = insertUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '無効な入力データです', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { username, email, password } = validationResult.data;
    
    // ユーザー名またはメールアドレスが既に存在するか確認
    const existingByUsername = await getUserByUsername(username);
    if (existingByUsername) {
      return NextResponse.json(
        { error: 'このユーザー名は既に使用されています' },
        { status: 409 }
      );
    }
    
    const existingByEmail = await getUserByEmail(email);
    if (existingByEmail) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 409 }
      );
    }
    
    // パスワードのハッシュ化
    const hashedPassword = await hashPassword(password);
    
    // ユーザーの作成
    const currentTime = new Date().toISOString();
    const newUser = await createUser({
      username,
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: currentTime,
      updatedAt: currentTime
    });
    
    // パスワードを除いたユーザー情報を返す
    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    return NextResponse.json(
      { error: 'ユーザー登録中にエラーが発生しました' },
      { status: 500 }
    );
  }
}