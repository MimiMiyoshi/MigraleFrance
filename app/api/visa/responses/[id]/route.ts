import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import * as db from '@/app/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(null, { status: 401 });
    }
    
    const responseId = parseInt(params.id);
    if (isNaN(responseId)) {
      return NextResponse.json(
        { message: '不正なレスポンスIDです' },
        { status: 400 }
      );
    }
    
    const visaResponse = await db.getResponse(responseId);
    
    if (!visaResponse) {
      return NextResponse.json(
        { message: 'ビザ回答が見つかりません' },
        { status: 404 }
      );
    }
    
    // 他のユーザーのビザ回答へのアクセスを防止
    if (visaResponse.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'このビザ回答へのアクセス権限がありません' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(visaResponse);
  } catch (error) {
    console.error('ビザ回答詳細取得エラー:', error);
    return NextResponse.json(
      { message: 'ビザ回答詳細の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}