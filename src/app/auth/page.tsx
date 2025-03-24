import { Metadata } from "next";

export const metadata: Metadata = {
  title: "認証 - Migrale",
  description: "ログインまたは新規登録を行ってください",
};

export default function AuthPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Migrale</h1>
          <p className="mt-2 text-gray-600">
            フランス移住をサポートするプラットフォーム
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <button
              type="button"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ログイン
            </button>
          </div>
          <div>
            <button
              type="button"
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              新規登録
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
