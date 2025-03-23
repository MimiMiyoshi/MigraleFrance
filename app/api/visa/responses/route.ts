import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getResponsesByUserId, createResponse } from '@/lib/db';
import { insertVisaResponseSchema } from '@/shared/schema';

/**
 * ユーザーのビザ回答一覧を取得するAPI
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
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
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body = await request.json();
    
    // ビザ回答スキーマを拡張してバリデーション
    const responseSchema = insertVisaResponseSchema.extend({
      responses: z.record(z.string()),
      result: z.string(),
    });
    
    const result = responseSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: '入力データが無効です', details: result.error.format() },
        { status: 400 }
      );
    }
    
    // ビザ回答作成
    const newResponse = await createResponse({
      ...result.data,
      userId,
      createdAt: new Date().toISOString(),
    });
    
    return NextResponse.json(newResponse, { status: 201 });
  } catch (error) {
    console.error('ビザ回答作成エラー:', error);
    return NextResponse.json(
      { error: 'ビザ回答の作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}