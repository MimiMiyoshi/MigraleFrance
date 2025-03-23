import Link from "next/link";
import { redirect } from "next/navigation";

export default function AuthError({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const errorMessages: { [key: string]: string } = {
    Configuration: "認証の設定に問題があります",
    AccessDenied: "アクセスが拒否されました",
    Verification: "メールアドレスの確認に失敗しました",
    Default: "認証中にエラーが発生しました",
  };

  const error = searchParams.error || "Default";
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">認証エラー</h1>
        <p className="text-muted-foreground">{errorMessage}</p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="inline-block rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
          >
            ログインページに戻る
          </Link>
          <Link
            href="/"
            className="inline-block rounded-md border border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground"
          >
            トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
