import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { getResponse } from '../../../../lib/db';

// ビザ回答IDをパラメータとして取得するための型
type ResponseParams = {
  params: {
    id: string;
  };
};

// 特定のビザ回答を取得するAPI
export async function GET(
  request: NextRequest,
  { params }: ResponseParams
) {
  try {
    // ビザ回答IDの取得
    const responseId = parseInt(params.id);
    
    if (isNaN(responseId)) {
      return NextResponse.json(
        { error: '無効なビザ回答IDです' },
        { status: 400 }
      );
    }

    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);

    // 認証されていない場合
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // ビザ回答の取得
    const visaResponse = await getResponse(responseId);
    
    if (!visaResponse) {
      return NextResponse.json(
        { error: 'ビザ回答が見つかりません' },
        { status: 404 }
      );
    }

    // ビザ回答のユーザーIDとログインユーザーIDが一致するか確認
    if (visaResponse.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'このビザ回答へのアクセス権がありません' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(visaResponse);
  } catch (error) {
    console.error('ビザ回答取得エラー:', error);
    return NextResponse.json(
      { error: 'ビザ回答の取得に失敗しました' },
      { status: 500 }
    );
  }
}