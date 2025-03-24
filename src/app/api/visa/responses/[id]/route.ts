import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getResponse } from "@/lib/db";

type ResponseParams = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, { params }: ResponseParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const responseId = parseInt(params.id);

    if (isNaN(responseId)) {
      return NextResponse.json(
        { error: "無効なレスポンスIDです" },
        { status: 400 }
      );
    }

    const visaResponse = await getResponse(responseId);

    if (!visaResponse) {
      return NextResponse.json(
        { error: "ビザ回答が見つかりません" },
        { status: 404 }
      );
    }

    // 所有権の確認
    if (visaResponse.userId !== session.user.id) {
      return NextResponse.json(
        { error: "このビザ回答にアクセスする権限がありません" },
        { status: 403 }
      );
    }

    return NextResponse.json(visaResponse);
  } catch (error) {
    console.error("ビザ回答取得エラー:", error);
    return NextResponse.json(
      { error: "ビザ回答の取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
