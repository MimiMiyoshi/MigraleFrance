import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import * as db from '@/app/lib/db';

export async function GET(request: NextRequest) {
  try {
    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);
    
    // 未認証の場合は401エラー
    if (!session || !session.user) {
      return NextResponse.json(null, { status: 401 });
    }
    
    // データベースからユーザー情報を取得
    const user = await db.getUser(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { message: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }
    
    // パスワードを除外してレスポンスを返す
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('ユーザー取得エラー:', error);
    return NextResponse.json(
      { message: 'ユーザー情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}