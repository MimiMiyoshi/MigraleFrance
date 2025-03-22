import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);
    
    // 未認証の場合は401エラー
    if (!session || !session.user) {
      return new NextResponse(null, { status: 401 });
    }
    
    // セッションからユーザー情報を返す
    return NextResponse.json(session.user);
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error);
    return NextResponse.json(
      { message: 'ユーザー情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}