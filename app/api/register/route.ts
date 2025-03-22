import { NextRequest, NextResponse } from 'next/server';
import { InsertUser } from '../../../shared/schema';
import { hashPassword } from '@/app/utils/auth';
import * as db from '@/app/lib/db';

export async function POST(request: NextRequest) {
  // リクエストのボディを取得
  try {
    const body = await request.json();
    
    // 必須フィールドの確認
    if (!body.username || !body.email || !body.password) {
      return NextResponse.json(
        { message: '必須フィールドがありません' },
        { status: 400 }
      );
    }
    
    // 既存ユーザーの確認
    const existingByUsername = await db.getUserByUsername(body.username);
    if (existingByUsername) {
      return NextResponse.json(
        { message: 'このユーザー名は既に使用されています' },
        { status: 400 }
      );
    }
    
    const existingByEmail = await db.getUserByEmail(body.email);
    if (existingByEmail) {
      return NextResponse.json(
        { message: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      );
    }
    
    // パスワードのハッシュ化
    const hashedPassword = await hashPassword(body.password);
    
    // ユーザーの作成
    const userData: InsertUser = {
      username: body.username,
      email: body.email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };
    
    const newUser = await db.createUser(userData);
    
    // パスワードを除いてレスポンスを返す
    const { password, ...userWithoutPassword } = newUser;
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: any) {
    console.error('ユーザー登録エラー:', error);
    return NextResponse.json(
      { message: error.message || 'ユーザー登録中にエラーが発生しました' },
      { status: 500 }
    );
  }
}