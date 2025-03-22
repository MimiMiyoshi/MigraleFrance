'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

interface DashboardProps {
  user: any; // 本来はセッションのユーザー型を定義する
}

export default function Dashboard({ user }: DashboardProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // タスク一覧を取得
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        if (!response.ok) {
          throw new Error('タスクの取得に失敗しました');
        }
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        console.error('タスク取得エラー:', err);
        setError('タスクを読み込めませんでした。');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // ログアウト処理
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Migrale</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              ようこそ、{user.username || user.name || 'ユーザー'}さん
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ウェルカムメッセージ */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 mb-8 text-white">
          <h2 className="text-xl font-bold mb-2">フランス移住計画を始めましょう</h2>
          <p className="mb-4">
            Migraleはあなたのフランス移住を段階的にサポートします。まずはビザ診断から始めて、最適なビザタイプを見つけましょう。
          </p>
          <Link
            href="/questionnaire"
            className="inline-block px-4 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50"
          >
            ビザ診断を開始する
          </Link>
        </div>

        {/* タスクセクション */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">移住タスク</h2>
            <Link
              href="/tasks"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              すべて表示
            </Link>
          </div>

          {loading ? (
            <div className="py-4 text-center text-gray-500">
              読み込み中...
            </div>
          ) : error ? (
            <div className="py-4 text-center text-red-500">
              {error}
            </div>
          ) : tasks.length === 0 ? (
            <div className="py-4 text-center text-gray-500">
              タスクがありません。診断結果に基づいて新しいタスクが追加されます。
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {tasks.slice(0, 5).map((task) => (
                <li key={task.id} className="py-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      readOnly
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <div className="ml-3">
                      <p className={`text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {task.title}
                      </p>
                      {task.dueDate && (
                        <p className="text-xs text-gray-500">
                          期限: {new Date(task.dueDate).toLocaleDateString('ja-JP')}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ヒントと文化紹介 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            フランス文化のヒント
          </h2>
          <div className="bg-blue-50 rounded-md p-4 border border-blue-100">
            <p className="text-sm text-gray-700">
              <span className="font-medium">今日のヒント:</span> フランスでは「Bonjour（ボンジュール）」の挨拶は非常に重要です。お店に入る時やサービスを受ける前に必ず挨拶をしましょう。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}