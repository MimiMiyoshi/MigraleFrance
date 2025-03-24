import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./lib/auth";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // ログイン済みの場合はダッシュボードへリダイレクト
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* ヒーローセクション */}
      <section className="w-full flex flex-col items-center justify-center py-20 px-4 bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-gradient">Migrale</span>
            <span className="block mt-2">フランス移住をもっと簡単に</span>
          </h1>

          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
            ビザの選択から申請書類の準備まで、あなたのフランス移住をサポートする日本人向けのプラットフォーム
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth"
              className="btn btn-primary px-8 py-3 text-lg hover-scale"
            >
              今すぐ始める
            </Link>
            <Link
              href="#features"
              className="btn btn-secondary px-8 py-3 text-lg"
            >
              詳細を見る
            </Link>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section
        id="features"
        className="w-full py-20 px-4 bg-white dark:bg-gray-900"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title text-center mb-12">Migraleの特徴</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 特徴1 */}
            <div className="card-shadow p-6 rounded-lg hover-scale bg-white dark:bg-gray-800">
              <div className="mb-4 text-blue-600 dark:text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">最適なビザの提案</h3>
              <p className="text-gray-600 dark:text-gray-300">
                あなたの状況に最適なビザタイプを、簡単な質問に答えるだけで提案します。
              </p>
            </div>

            {/* 特徴2 */}
            <div className="card-shadow p-6 rounded-lg hover-scale bg-white dark:bg-gray-800">
              <div className="mb-4 text-blue-600 dark:text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">タスク管理システム</h3>
              <p className="text-gray-600 dark:text-gray-300">
                ビザ申請に必要な書類や手続きを整理し、ステップバイステップで進捗を管理できます。
              </p>
            </div>

            {/* 特徴3 */}
            <div className="card-shadow p-6 rounded-lg hover-scale bg-white dark:bg-gray-800">
              <div className="mb-4 text-blue-600 dark:text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">文化的アドバイス</h3>
              <p className="text-gray-600 dark:text-gray-300">
                フランスの文化や習慣に関する情報を提供し、現地での生活をスムーズにスタートできるようサポートします。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="w-full py-16 px-4 bg-blue-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            フランスでの新生活を始めましょう
          </h2>
          <p className="text-xl mb-8">
            複雑な移住プロセスをシンプルに。Migraleがあなたの夢を実現するお手伝いをします。
          </p>
          <Link
            href="/auth"
            className="btn-gradient px-8 py-3 rounded-lg text-lg font-medium hover-scale inline-block"
          >
            無料でアカウント作成
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="w-full py-8 px-4 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-2xl font-bold text-gradient">Migrale</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Migrale. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
