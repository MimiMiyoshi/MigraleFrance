import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getResponsesByUserId, createResponse } from '../../../lib/db';
import { insertVisaResponseSchema } from '../../../shared/schema';

/**
 * ユーザーのビザ回答一覧を取得するAPI
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const responses = await getResponsesByUserId(userId);
    
    return NextResponse.json(responses);
  } catch (error) {
    console.error('ビザ回答一覧取得エラー:', error);
    return NextResponse.json(
      { error: 'ビザ回答一覧の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * 新しいビザ回答を作成するAPI
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body = await request.json();
    
    // ユーザーIDをリクエストボディにセット
    const responseData = { ...body, userId };
    
    // バリデーション
    const validationResult = insertVisaResponseSchema.safeParse(responseData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '無効な入力データです', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    // ビザ回答の作成
    const newResponse = await createResponse(validationResult.data);
    
    return NextResponse.json(newResponse, { status: 201 });
  } catch (error) {
    console.error('ビザ回答作成エラー:', error);
    return NextResponse.json(
      { error: 'ビザ回答の作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}