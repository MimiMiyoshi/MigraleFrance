import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '../../utils/auth';
import { createUser, getUserByUsername, getUserByEmail } from '../../lib/db';
import { insertUserSchema } from '../../shared/schema';

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
        { error: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      );
    }
    
    // パスワードのハッシュ化
    const hashedPassword = await hashPassword(password);
    
    // 新しいユーザーを作成
    const newUser = await createUser({
      ...validationResult.data,
      password: hashedPassword,
      role: 'user', // デフォルトロール
    });
    
    // パスワードを含まない形でレスポンスを返す
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