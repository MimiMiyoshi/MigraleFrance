import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import * as db from "@/app/lib/db";

// ユーザープロファイルを取得
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json(
      { message: "認証されていません" }, 
      { status: 401 }
    );
  }
  
  try {
    const userId = parseInt(session.user.id);
    const user = await db.getUser(userId);
    
    if (!user) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }
    
    // パスワードを除外したプロファイル情報を返す
    const { password, ...profile } = user;
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { message: "プロファイルの取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

// プロファイル情報を更新（現在はパスワード変更のみ）
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json(
      { message: "認証されていません" }, 
      { status: 401 }
    );
  }
  
  try {
    const userId = parseInt(session.user.id);
    const { currentPassword, newPassword } = await request.json();
    
    // ここでパスワード変更のロジックを実装
    // 注: 現在のスキーマでは、パスワード変更のエンドポイントはまだ未実装です
    // 実装する場合は、app/utils/auth.tsのcomparePasswordsとhashPasswordを使用
    
    return NextResponse.json(
      { message: "この機能は現在実装中です" },
      { status: 501 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "プロファイルの更新中にエラーが発生しました" },
      { status: 500 }
    );
  }
}