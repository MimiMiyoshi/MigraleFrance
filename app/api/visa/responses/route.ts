import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import * as db from '@/app/lib/db';
import { insertVisaResponseSchema } from '@/shared/schema';

export async function GET(request: NextRequest) {
  try {
    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);
    
    // 未認証の場合は401エラー
    if (!session || !session.user) {
      return NextResponse.json(null, { status: 401 });
    }
    
    // ユーザーIDに関連するビザ回答を取得
    const responses = await db.getResponsesByUserId(session.user.id);
    
    return NextResponse.json(responses);
  } catch (error) {
    console.error('ビザ回答取得エラー:', error);
    return NextResponse.json(
      { message: 'ビザ回答の取得中にエラーが発生しました' },
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
      return NextResponse.json(null, { status: 401 });
    }
    
    // リクエストボディからビザ回答データを取得
    const body = await request.json();
    
    // 入力データを検証
    const result = insertVisaResponseSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: '入力データが不正です', errors: result.error.format() },
        { status: 400 }
      );
    }
    
    // ビザ回答を作成
    const responseData = {
      userId: session.user.id,
      responses: body.responses,
      result: body.result
    };
    
    const response = await db.createResponse(responseData);
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('ビザ回答作成エラー:', error);
    return NextResponse.json(
      { message: 'ビザ回答の作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}