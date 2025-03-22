import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import * as db from '@/app/lib/db';
import { z } from 'zod';

// プロファイル更新スキーマ
const updateProfileSchema = z.object({
  email: z.string().email({ message: '有効なメールアドレスを入力してください' }).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(null, { status: 401 });
    }
    
    const user = await db.getUser(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { message: 'プロフィールが見つかりません' },
        { status: 404 }
      );
    }
    
    // パスワードを除外してレスポンスを返す
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('プロフィール取得エラー:', error);
    return NextResponse.json(
      { message: 'プロフィール情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(null, { status: 401 });
    }
    
    const body = await request.json();
    
    // 入力データを検証
    const result = updateProfileSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: '入力データが不正です', errors: result.error.format() },
        { status: 400 }
      );
    }
    
    // メールアドレスが変更される場合、重複チェック
    if (body.email) {
      const existingEmail = await db.getUserByEmail(body.email);
      if (existingEmail && existingEmail.id !== session.user.id) {
        return NextResponse.json(
          { message: 'このメールアドレスはすでに登録されています' },
          { status: 400 }
        );
      }
    }
    
    // プロフィールを更新
    const updatedUser = await db.updateTask(session.user.id, body);
    
    if (!updatedUser) {
      return NextResponse.json(
        { message: 'プロフィールの更新に失敗しました' },
        { status: 404 }
      );
    }
    
    // パスワードを除外してレスポンスを返す
    const { password, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    return NextResponse.json(
      { message: 'プロフィール情報の更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}