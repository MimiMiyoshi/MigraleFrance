import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getResponsesByUserId, createResponse } from '../../../lib/db';
import { insertVisaResponseSchema } from '../../../shared/schema';

/**
 * ユーザーのビザ回答一覧を取得するAPI
 */
export async function GET(request: NextRequest) {
  try {
    // セッションの取得
    const session = await getServerSession(authOptions);

    // 未認証の場合は401エラー
    if (!session) {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 });
    }

    // ビザ回答一覧の取得
    const responses = await getResponsesByUserId(Number(session.user.id));
    
    return NextResponse.json(responses);
  } catch (error) {
    console.error('ビザ回答一覧取得エラー:', error);
    return NextResponse.json(
      { message: 'ビザ回答一覧の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * 新しいビザ回答を作成するAPI
 */
export async function POST(request: NextRequest) {
  try {
    // セッションの取得
    const session = await getServerSession(authOptions);

    // 未認証の場合は401エラー
    if (!session) {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 });
    }

    // リクエストボディの取得
    const body = await request.json();

    // バリデーション
    const result = insertVisaResponseSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: '無効なビザ回答データです', errors: result.error.errors },
        { status: 400 }
      );
    }

    // ビザ回答の作成（ユーザーIDを設定）
    const response = await createResponse({
      ...body,
      userId: Number(session.user.id),
    });
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('ビザ回答作成エラー:', error);
    return NextResponse.json(
      { message: 'ビザ回答の作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}