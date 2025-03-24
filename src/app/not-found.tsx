import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-xl font-semibold">ページが見つかりません</h2>
        <p className="text-muted-foreground">
          お探しのページは存在しないか、移動された可能性があります。
        </p>
        <Link
          href="/"
          className="inline-block rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          トップページに戻る
        </Link>
      </div>
    </div>
  );
}
