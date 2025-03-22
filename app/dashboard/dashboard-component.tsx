'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface DashboardProps {
  user: any; // 本来はセッションのユーザー型を定義する
}

export default function Dashboard({ user }: DashboardProps) {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 統計情報を取得
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
          throw new Error('統計情報の取得に失敗しました');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('統計情報取得エラー:', err);
        setError('統計情報の読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gradient">Migrale</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 dark:text-gray-300">
                {user?.username || 'ユーザー'} さん
              </span>
              <Link href="/api/auth/signout" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                ログアウト
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ウェルカムメッセージ */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">
              ようこそ、{user?.username || 'ユーザー'}さん！
            </h2>
            <p>
              Migraleを使ってフランス移住をスムーズに進めましょう。あなたに最適なビザタイプを見つけ、必要な手続きを管理します。
            </p>
          </div>
        </section>

        {/* 統計情報とクイックアクション */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* タスク進捗 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">タスク進捗</h3>
            {stats?.tasksStats ? (
              <>
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span>完了率</span>
                    <span>{stats.tasksStats.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${stats.tasksStats.completionRate}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>合計タスク</span>
                    <span>{stats.tasksStats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>完了タスク</span>
                    <span className="text-green-600">{stats.tasksStats.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>未完了タスク</span>
                    <span className="text-amber-600">{stats.tasksStats.incomplete}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>期限切れ</span>
                    <span className="text-red-600">{stats.tasksStats.overdue}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                タスクがまだ登録されていません。
              </p>
            )}
          </div>

          {/* 今後の予定 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">今後の予定</h3>
            {stats?.tasksStats && stats.tasksStats.dueToday + stats.tasksStats.dueTomorrow + stats.tasksStats.dueThisWeek > 0 ? (
              <div className="space-y-3">
                {stats.tasksStats.dueToday > 0 && (
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="flex items-center text-red-600">
                      <span className="h-2 w-2 bg-red-600 rounded-full mr-2"></span>
                      今日
                    </span>
                    <span className="font-medium">{stats.tasksStats.dueToday}件</span>
                  </div>
                )}
                {stats.tasksStats.dueTomorrow > 0 && (
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="flex items-center text-orange-600">
                      <span className="h-2 w-2 bg-orange-600 rounded-full mr-2"></span>
                      明日
                    </span>
                    <span className="font-medium">{stats.tasksStats.dueTomorrow}件</span>
                  </div>
                )}
                {stats.tasksStats.dueThisWeek > 0 && (
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="flex items-center text-blue-600">
                      <span className="h-2 w-2 bg-blue-600 rounded-full mr-2"></span>
                      今週
                    </span>
                    <span className="font-medium">{stats.tasksStats.dueThisWeek}件</span>
                  </div>
                )}
                {stats.tasksStats.dueThisMonth > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-green-600">
                      <span className="h-2 w-2 bg-green-600 rounded-full mr-2"></span>
                      今月
                    </span>
                    <span className="font-medium">{stats.tasksStats.dueThisMonth}件</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                今後の予定はありません。
              </p>
            )}
          </div>

          {/* クイックアクション */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">クイックアクション</h3>
            <div className="space-y-3">
              <Link href="/questionnaire" className="block w-full py-2 px-4 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-md transition-colors">
                ビザ診断を受ける
              </Link>
              <Link href="/tasks" className="block w-full py-2 px-4 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-800 dark:text-green-200 rounded-md transition-colors">
                タスクを管理する
              </Link>
              {stats?.visaStats?.latestResult && (
                <Link href="/visa-result" className="block w-full py-2 px-4 bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-md transition-colors">
                  ビザ結果を確認する
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* フランス文化情報 */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">今日のフランス豆知識</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4">
            <p className="text-gray-700 dark:text-gray-300">
              <span className="block font-medium mb-2">フランスのビジネスマナー</span>
              フランスでは初対面の挨拶では握手が一般的ですが、親しくなるとほっぺにキスをする「ビズ」という習慣があります。地域によって2回から4回とキスの回数が異なるので注意が必要です。
            </p>
          </div>
        </section>

        {/* 最新のニュース */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">最新ビザ情報</h3>
          <div className="space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h4 className="font-medium mb-1">デジタルノマドビザの新要件</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                フランス政府はデジタルノマドビザの要件を更新し、最低収入条件が年間30,000ユーロに変更されました。
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-500">2023年3月15日</span>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h4 className="font-medium mb-1">ロングステイビザの申請書類簡素化</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                フランス政府は観光目的のロングステイビザに関する申請書類を簡素化し、一部のカテゴリーでは銀行残高証明の要件が緩和されました。
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-500">2023年2月1日</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}