import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getUser, updateUser } from '@/lib/db';
import { z } from 'zod';

// プロフィール更新のバリデーションスキーマ
const profileUpdateSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください').optional(),
  username: z.string().min(3, 'ユーザー名は3文字以上で入力してください').optional()
});

/**
 * ユーザープロフィール情報を取得するAPI
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }
    
    const user = await getUser(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }
    
    // パスワードフィールドを除外
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('プロフィール取得エラー:', error);
    return NextResponse.json(
      { error: 'プロフィール情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * ユーザープロフィールを更新するAPI
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // バリデーション
    const validationResult = profileUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '入力データが不正です', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    // 更新
    const updatedUser = await updateUser(session.user.id, validationResult.data);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }
    
    // パスワードフィールドを除外
    const { password, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    return NextResponse.json(
      { error: 'プロフィール情報の更新に失敗しました' },
      { status: 500 }
    );
  }
}