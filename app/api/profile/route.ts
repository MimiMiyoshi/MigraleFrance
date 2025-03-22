import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getUser, updateUser } from '../../lib/db';
import { z } from 'zod';

/**
 * ユーザープロフィール情報を取得するAPI
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const user = await getUser(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }
    
    // パスワードは返さない
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('プロフィール取得エラー:', error);
    return NextResponse.json(
      { error: 'プロフィールの取得中にエラーが発生しました' },
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
    
    if (!session) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body = await request.json();
    
    // 更新可能なフィールドを制限
    const updateSchema = z.object({
      email: z.string().email().optional(),
      // 他の更新可能なフィールドがあればここに追加
    });
    
    // バリデーション
    const validationResult = updateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '無効な入力データです', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    // ユーザー情報を更新
    const updatedUser = await updateUser(userId, validationResult.data);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'ユーザー情報の更新に失敗しました' },
        { status: 500 }
      );
    }
    
    // パスワードは返さない
    const { password, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    return NextResponse.json(
      { error: 'プロフィールの更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}