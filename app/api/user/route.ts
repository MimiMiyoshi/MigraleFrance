import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { message: "認証されていません" },
      { status: 401 }
    );
  }
  
  // セッションからユーザー情報を返す
  return NextResponse.json(session.user);
}