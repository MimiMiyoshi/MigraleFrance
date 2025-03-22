import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import * as db from '@/app/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);
    
    // 未認証の場合は401エラー
    if (!session || !session.user) {
      return new NextResponse(null, { status: 401 });
    }
    
    // ビザ回答IDを数値に変換
    const responseId = parseInt(params.id);
    if (isNaN(responseId)) {
      return NextResponse.json(
        { message: '無効なビザ回答IDです' },
        { status: 400 }
      );
    }
    
    // ビザ回答を取得
    const response = await db.getResponse(responseId);
    
    // ビザ回答が存在しない場合は404エラー
    if (!response) {
      return NextResponse.json(
        { message: 'ビザ回答が見つかりません' },
        { status: 404 }
      );
    }
    
    // 他のユーザーのビザ回答は閲覧不可
    if (response.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'このビザ回答にアクセスする権限がありません' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('ビザ回答取得エラー:', error);
    return NextResponse.json(
      { message: 'ビザ回答の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}