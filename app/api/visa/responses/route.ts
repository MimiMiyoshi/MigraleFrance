import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getResponsesByUserId, createResponse } from '../../../lib/db';

/**
 * ユーザーのビザ回答一覧を取得するAPI
 */
export async function GET(request: NextRequest) {
  try {
    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);

    // 認証されていない場合
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // ユーザーのビザ回答一覧を取得
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
    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);

    // 認証されていない場合
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // リクエストボディの解析
    const body = await request.json();
    
    // バリデーションスキーマ
    const responseSchema = z.object({
      responses: z.record(z.string(), z.string()),
      result: z.string(),
    });
    
    // バリデーション
    const validationResult = responseSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: '入力内容に問題があります', 
          details: validationResult.error.errors 
        }, 
        { status: 400 }
      );
    }

    const { responses, result } = validationResult.data;
    const now = new Date().toISOString();

    // ビザ回答の作成
    const visaResponse = await createResponse({
      userId: session.user.id,
      responses,
      result,
      createdAt: now
    });
    
    return NextResponse.json(visaResponse, { status: 201 });
  } catch (error) {
    console.error('ビザ回答作成エラー:', error);
    return NextResponse.json(
      { error: 'ビザ回答の作成に失敗しました' },
      { status: 500 }
    );
  }
}