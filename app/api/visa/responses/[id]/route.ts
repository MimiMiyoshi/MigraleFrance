import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { getResponse } from '../../../../lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // セッションの取得
    const session = await getServerSession(authOptions);

    // 未認証の場合は401エラー
    if (!session) {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 });
    }

    const responseId = Number(params.id);
    
    // ビザ回答の取得
    const response = await getResponse(responseId);
    
    // ビザ回答が見つからない場合は404エラー
    if (!response) {
      return NextResponse.json({ message: 'ビザ回答が見つかりません' }, { status: 404 });
    }
    
    // 他のユーザーのビザ回答へのアクセスを防止
    if (response.userId !== Number(session.user.id)) {
      return NextResponse.json({ message: 'アクセス権限がありません' }, { status: 403 });
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