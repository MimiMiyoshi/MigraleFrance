import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import * as db from "@/app/lib/db";

// 特定のビザ回答を取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json(
      { message: "認証されていません" }, 
      { status: 401 }
    );
  }
  
  try {
    const responseId = parseInt(params.id);
    const response = await db.getResponse(responseId);
    
    if (!response) {
      return NextResponse.json(
        { message: "ビザ回答が見つかりません" },
        { status: 404 }
      );
    }
    
    // 他のユーザーの回答にアクセスさせない
    const userId = parseInt(session.user.id);
    if (response.userId !== userId) {
      return NextResponse.json(
        { message: "この回答へのアクセス権限がありません" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Visa response fetch error:", error);
    return NextResponse.json(
      { message: "ビザ回答の取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}