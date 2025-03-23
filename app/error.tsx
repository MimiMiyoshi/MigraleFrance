"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーをログに記録
    console.error("エラーが発生しました:", error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">エラーが発生しました</h1>
        <p className="text-muted-foreground">
          申し訳ありません。予期せぬエラーが発生しました。
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="inline-block rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
          >
            もう一度試す
          </button>
          <Link
            href="/"
            className="inline-block rounded-md border border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground"
          >
            トップページに戻る
          </Link>
        </div>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 rounded-md bg-muted p-4 text-left">
            <p className="font-mono text-sm text-muted-foreground">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
