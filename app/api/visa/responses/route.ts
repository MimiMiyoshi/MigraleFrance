import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getResponsesByUserId, createResponse } from '@/lib/db';
import { insertVisaResponseSchema } from '@/shared/schema';

/**
 * ユーザーのビザ回答一覧を取得するAPI
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }
    
    const responses = await getResponsesByUserId(session.user.id);
    
    return NextResponse.json(responses);
  } catch (error) {
    console.error('ビザ回答一覧取得エラー:', error);
    return NextResponse.json(
      { error: 'ビザ回答一覧の取得に失敗しました' },
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
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // ユーザーIDと作成日時を追加
    const responseData = {
      ...body,
      userId: session.user.id,
      createdAt: new Date().toISOString()
    };
    
    // バリデーション
    const validationResult = insertVisaResponseSchema.safeParse(responseData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '入力データが不正です', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    // 回答作成
    const newResponse = await createResponse(validationResult.data);
    
    return NextResponse.json(newResponse, { status: 201 });
  } catch (error) {
    console.error('ビザ回答作成エラー:', error);
    return NextResponse.json(
      { error: 'ビザ回答の作成に失敗しました' },
      { status: 500 }
    );
  }
}