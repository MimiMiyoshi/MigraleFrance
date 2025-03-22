import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getUser, updateUser } from '@/lib/db';
import { z } from 'zod';

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
    
    // パスワードは返さない
    const { password, ...userProfile } = user;
    
    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('プロフィール取得エラー:', error);
    return NextResponse.json(
      { error: 'プロフィールの取得に失敗しました' },
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
    
    // 更新可能なフィールドをバリデーション
    const updateSchema = z.object({
      email: z.string().email({ message: '有効なメールアドレスを入力してください' }).optional(),
      // 他の更新可能なフィールドがあればここに追加
    });
    
    const validationResult = updateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '入力データが不正です', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const updates = validationResult.data;
    
    // ユーザープロフィールを更新
    const updatedUser = await updateUser(session.user.id, updates);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'プロフィールの更新に失敗しました' },
        { status: 500 }
      );
    }
    
    // パスワードは返さない
    const { password, ...updatedProfile } = updatedUser;
    
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    return NextResponse.json(
      { error: 'プロフィールの更新に失敗しました' },
      { status: 500 }
    );
  }
}