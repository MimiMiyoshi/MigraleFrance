import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import * as db from "@/app/lib/db";
import { insertVisaResponseSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// ユーザーのビザ回答を取得
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
    const responses = await db.getResponsesByUserId(userId);
    return NextResponse.json(responses);
  } catch (error) {
    console.error("Visa responses fetch error:", error);
    return NextResponse.json(
      { message: "ビザ回答の取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

// 新しいビザ回答を保存
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json(
      { message: "認証されていません" }, 
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    const userId = parseInt(session.user.id);
    
    // 現在の日時を取得
    const now = new Date().toISOString();
    
    // リクエストデータをバリデーション
    const responseData = insertVisaResponseSchema.parse({
      ...body,
      userId, // セッションからユーザーIDを追加
      createdAt: now
    });
    
    const newResponse = await db.createResponse(responseData);
    return NextResponse.json(newResponse, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return NextResponse.json(
        { message: validationError.message },
        { status: 400 }
      );
    }
    
    console.error("Visa response creation error:", error);
    return NextResponse.json(
      { message: "ビザ回答の保存中にエラーが発生しました" },
      { status: 500 }
    );
  }
}