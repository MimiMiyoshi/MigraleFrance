import { NextResponse } from "next/server";
import { insertUserSchema } from "@shared/schema";
import { hashPassword } from "@/app/utils/auth";
import * as db from "@/app/lib/db";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // リクエストデータをバリデーション
    const userData = insertUserSchema.parse(body);
    
    // ユーザー名の重複チェック
    const usernameExists = await db.getUserByUsername(userData.username);
    if (usernameExists) {
      return NextResponse.json(
        { message: "このユーザー名は既に使用されています" },
        { status: 400 }
      );
    }
    
    // メールアドレスの重複チェック
    const emailExists = await db.getUserByEmail(userData.email);
    if (emailExists) {
      return NextResponse.json(
        { message: "このメールアドレスは既に使用されています" },
        { status: 400 }
      );
    }
    
    // ユーザー作成
    const user = await db.createUser({
      ...userData,
      password: await hashPassword(userData.password)
    });
    
    // パスワードを除外してレスポンスを返す
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return NextResponse.json(
        { message: validationError.message },
        { status: 400 }
      );
    }
    
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "ユーザー登録中にエラーが発生しました" },
      { status: 500 }
    );
  }
}