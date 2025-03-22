import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import * as db from '@/app/lib/db';
import { InsertVisaResponse } from '../../../../shared/schema';

export async function GET(request: NextRequest) {
  try {
    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);
    
    // 未認証の場合は401エラー
    if (!session || !session.user) {
      return new NextResponse(null, { status: 401 });
    }
    
    // ユーザーIDに関連するビザ回答を取得
    const responses = await db.getResponsesByUserId(session.user.id);
    
    return NextResponse.json(responses);
  } catch (error) {
    console.error('ビザ回答一覧取得エラー:', error);
    return NextResponse.json(
      { message: 'ビザ回答一覧の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);
    
    // 未認証の場合は401エラー
    if (!session || !session.user) {
      return new NextResponse(null, { status: 401 });
    }
    
    // リクエストのボディを取得
    const body = await request.json();
    
    // 必須フィールドの確認
    if (!body.responses || !body.result) {
      return NextResponse.json(
        { message: '回答内容とビザタイプの結果は必須です' },
        { status: 400 }
      );
    }
    
    // ビザ回答データの作成
    const responseData: InsertVisaResponse = {
      userId: session.user.id,
      responses: body.responses,
      result: body.result,
      createdAt: new Date().toISOString(),
    };
    
    // ビザ回答を保存
    const newResponse = await db.createResponse(responseData);
    
    return NextResponse.json(newResponse, { status: 201 });
  } catch (error: any) {
    console.error('ビザ回答保存エラー:', error);
    return NextResponse.json(
      { message: error.message || 'ビザ回答の保存中にエラーが発生しました' },
      { status: 500 }
    );
  }
}