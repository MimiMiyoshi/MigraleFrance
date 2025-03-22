import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { getResponse } from '../../../../lib/db';

type ResponseParams = {
  params: {
    id: string;
  };
};

export async function GET(
  request: NextRequest,
  { params }: ResponseParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }
    
    const responseId = parseInt(params.id);
    if (isNaN(responseId)) {
      return NextResponse.json(
        { error: '無効な回答IDです' },
        { status: 400 }
      );
    }
    
    const response = await getResponse(responseId);
    
    if (!response) {
      return NextResponse.json(
        { error: 'ビザ回答が見つかりません' },
        { status: 404 }
      );
    }
    
    // 他のユーザーの回答へのアクセスを防止
    if (response.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'この回答へのアクセス権がありません' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('ビザ回答取得エラー:', error);
    return NextResponse.json(
      { error: 'ビザ回答の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}