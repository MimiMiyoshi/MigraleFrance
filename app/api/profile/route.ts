import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getUser, updateUser, getUserByEmail } from '../../lib/db';
import { z } from 'zod';

// プロフィール更新用のスキーマ
const updateProfileSchema = z.object({
  email: z.string().email({ message: '有効なメールアドレスを入力してください' }).optional(),
  username: z.string().min(3, { message: 'ユーザー名は3文字以上である必要があります' }).optional(),
});

/**
 * ユーザープロフィール情報を取得するAPI
 */
export async function GET(request: NextRequest) {
  try {
    // セッションの取得
    const session = await getServerSession(authOptions);

    // 未認証の場合は401エラー
    if (!session) {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 });
    }

    // データベースからユーザー情報を取得
    const user = await getUser(Number(session.user.id));
    
    // ユーザーが見つからない場合は404エラー
    if (!user) {
      return NextResponse.json({ message: 'ユーザーが見つかりません' }, { status: 404 });
    }

    // パスワードを除外して返す
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

/**
 * ユーザープロフィールを更新するAPI
 */
export async function PATCH(request: NextRequest) {
  try {
    // セッションの取得
    const session = await getServerSession(authOptions);

    // 未認証の場合は401エラー
    if (!session) {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 });
    }

    // リクエストボディの取得
    const body = await request.json();

    // バリデーション
    const result = updateProfileSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: '無効なプロフィールデータです', errors: result.error.errors },
        { status: 400 }
      );
    }

    // メールアドレスの更新時に重複チェック
    if (body.email) {
      const existingUser = await getUserByEmail(body.email);
      if (existingUser && existingUser.id !== Number(session.user.id)) {
        return NextResponse.json(
          { message: 'このメールアドレスは既に使用されています' },
          { status: 400 }
        );
      }
    }

    // ユーザーの取得と更新
    const updatedUser = await updateUser(Number(session.user.id), body);
    
    // ユーザーが見つからない場合
    if (!updatedUser) {
      return NextResponse.json({ message: 'ユーザーが見つかりません' }, { status: 404 });
    }

    // パスワードを除外して返す
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