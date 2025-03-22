import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { getUser, updateUser } from '../../lib/db';
import { authOptions } from '../auth/[...nextauth]/route';
import { comparePasswords, hashPassword } from '../../utils/auth';

/**
 * ユーザープロフィール情報を取得するAPI
 */
export async function GET(request: NextRequest) {
  try {
    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);

    // 認証されていない場合
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // ユーザー詳細情報を取得
    const user = await getUser(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // パスワードを除いたプロフィール情報を返す
    const { password, ...profile } = user;
    
    return NextResponse.json(profile);
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
    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);

    // 認証されていない場合
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // リクエストボディの解析
    const body = await request.json();
    
    // 更新スキーマの定義
    const updateSchema = z.object({
      email: z.string().email('有効なメールアドレスを入力してください').optional(),
      currentPassword: z.string().optional(),
      newPassword: z.string().min(8, 'パスワードは8文字以上必要です').optional(),
    });
    
    // バリデーション
    const validationResult = updateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: '入力内容に問題があります', 
          details: validationResult.error.errors 
        }, 
        { status: 400 }
      );
    }

    const { email, currentPassword, newPassword } = validationResult.data;
    
    // ユーザー情報の取得
    const user = await getUser(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // 更新データの準備
    const updates: {
      email?: string;
      password?: string;
    } = {};

    // メールアドレスの更新
    if (email && email !== user.email) {
      updates.email = email;
    }

    // パスワードの更新
    if (currentPassword && newPassword) {
      // 現在のパスワードが正しいか確認
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: '現在のパスワードが正しくありません' },
          { status: 400 }
        );
      }
      
      // 新しいパスワードをハッシュ化
      updates.password = await hashPassword(newPassword);
    }

    // 更新するデータがなければエラー
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: '更新するデータがありません' },
        { status: 400 }
      );
    }

    // ユーザー情報の更新
    const updatedUser = await updateUser(session.user.id, updates);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'プロフィール更新に失敗しました' },
        { status: 500 }
      );
    }

    // パスワードを除いた更新後のプロフィール情報を返す
    const { password: _, ...updatedProfile } = updatedUser;
    
    return NextResponse.json({
      message: 'プロフィールを更新しました',
      user: updatedProfile
    });
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    return NextResponse.json(
      { error: 'プロフィール情報の更新に失敗しました' },
      { status: 500 }
    );
  }
}