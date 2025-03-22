import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getUser } from '../../lib/db';

/**
 * 現在のログインユーザー情報を取得するAPI
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
    console.error('ユーザー情報取得エラー:', error);
    return NextResponse.json(
      { message: 'ユーザー情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}