import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import * as db from '@/app/lib/db';

export async function GET(request: NextRequest) {
  try {
    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);
    
    // 未認証の場合は401エラー
    if (!session || !session.user) {
      return new NextResponse(null, { status: 401 });
    }
    
    // ユーザーの詳細情報を取得
    const user = await db.getUser(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { message: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }
    
    // パスワードを除いたユーザー情報を返す
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('プロファイル情報取得エラー:', error);
    return NextResponse.json(
      { message: 'プロファイル情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);
    
    // 未認証の場合は401エラー
    if (!session || !session.user) {
      return new NextResponse(null, { status: 401 });
    }
    
    // リクエストのボディを取得
    const body = await request.json();
    
    // ユーザーの詳細情報を取得
    const user = await db.getUser(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { message: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }
    
    // 更新データの作成（メールアドレスのみ更新可能）
    const updateData: any = {};
    
    if (body.email !== undefined) {
      // 既に使用されているメールアドレスかチェック
      if (body.email !== user.email) {
        const existingByEmail = await db.getUserByEmail(body.email);
        if (existingByEmail) {
          return NextResponse.json(
            { message: 'このメールアドレスは既に使用されています' },
            { status: 400 }
          );
        }
      }
      updateData.email = body.email;
    }
    
    // ユーザーデータがあれば更新
    if (Object.keys(updateData).length > 0) {
      // TODO: データベースにユーザー更新機能を実装
      // const updatedUser = await db.updateUser(session.user.id, updateData);
      
      // 現状ではまだ実装されていないので、元のユーザー情報を返す
      const { password, ...userWithoutPassword } = user;
      return NextResponse.json({
        ...userWithoutPassword,
        ...updateData,
      });
    }
    
    // 更新データがなければ現在のユーザー情報を返す
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    console.error('プロファイル更新エラー:', error);
    return NextResponse.json(
      { message: error.message || 'プロファイルの更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}