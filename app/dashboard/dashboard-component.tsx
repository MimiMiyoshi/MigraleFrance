'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { statsAPI, taskAPI } from '../services/api';
import { CalendarIcon, CheckCircleIcon, ListTodoIcon, FileTextIcon } from 'lucide-react';

// ダッシュボード用のクライアントコンポーネント
export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [motivationalMessage, setMotivationalMessage] = useState('');

  useEffect(() => {
    // 統計情報とタスク情報を取得
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 統計情報を取得
        const statsData = await statsAPI.getUserStats();
        setStats(statsData);
        
        // タスク一覧を取得し、最新の3件を抽出
        const tasksData = await taskAPI.getAllTasks();
        setRecentTasks(tasksData.slice(0, 3));
        
        // AIエージェントの励ましメッセージ（後で実装）
        generateMotivationalMessage(statsData);
        
        setLoading(false);
      } catch (error) {
        console.error('データ取得エラー:', error);
        setLoading(false);
      }
    };
    
    if (session) {
      fetchData();
    }
  }, [session]);

  // AIエージェントの励ましメッセージを生成
  const generateMotivationalMessage = (statsData: any) => {
    if (!statsData) return;
    
    const messages = [
      'フランスへの一歩を踏み出しましたね！素晴らしい進捗です。',
      '今日も一つずつタスクをこなしていきましょう。フランスがあなたを待っています！',
      'タスクの完了は、新しい生活への一歩です。頑張りましょう！',
      'ビザの準備は着実に進んでいます。あなたの努力が実を結びます。',
      'パリのカフェでコーヒーを飲む日も近いですよ！',
    ];
    
    // 完了率に応じたメッセージを追加
    if (statsData.tasks && statsData.tasks.completionRate > 0) {
      const completionRate = parseFloat(statsData.tasks.completionRate);
      
      if (completionRate >= 75) {
        messages.push('素晴らしい進捗です！もう少しでフランスへの準備が整いますね。');
      } else if (completionRate >= 50) {
        messages.push('タスクの半分以上が完了していますね。この調子で頑張りましょう！');
      } else if (completionRate >= 25) {
        messages.push('一歩一歩着実に前進していますね。引き続き頑張りましょう！');
      } else {
        messages.push('始めたばかりですね。焦らず一つずつ進めていきましょう。');
      }
    }
    
    // ランダムにメッセージを選択
    const randomIndex = Math.floor(Math.random() * messages.length);
    setMotivationalMessage(messages[randomIndex]);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* ユーザー歓迎メッセージ */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          ようこそ、{session?.user?.name || 'ユーザー'}さん
        </h1>
        <p className="text-lg text-muted-foreground">
          Migraleがあなたのフランス移住をサポートします
        </p>
      </div>
      
      {/* AIエージェントの励ましメッセージ */}
      {motivationalMessage && (
        <div className="bg-accent/20 border border-accent rounded-lg p-4 mb-8">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-accent/30 p-2 text-accent-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bot"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
            </div>
            <div>
              <h3 className="font-medium mb-1">AIエージェントからのメッセージ</h3>
              <p className="text-muted-foreground">{motivationalMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* 統計情報カード */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* 全タスク数 */}
          <div className="bg-card rounded-lg border shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">全タスク</h3>
              <ListTodoIcon className="text-muted-foreground h-5 w-5" />
            </div>
            <p className="text-3xl font-bold">{stats.tasks.total}</p>
          </div>
          
          {/* 完了タスク */}
          <div className="bg-card rounded-lg border shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">完了タスク</h3>
              <CheckCircleIcon className="text-green-500 h-5 w-5" />
            </div>
            <p className="text-3xl font-bold">{stats.tasks.completed}</p>
          </div>
          
          {/* 完了率 */}
          <div className="bg-card rounded-lg border shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">完了率</h3>
              <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">%</div>
            </div>
            <p className="text-3xl font-bold">{stats.tasks.completionRate}%</p>
          </div>
          
          {/* ビザ診断回数 */}
          <div className="bg-card rounded-lg border shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">ビザ診断回数</h3>
              <FileTextIcon className="text-muted-foreground h-5 w-5" />
            </div>
            <p className="text-3xl font-bold">{stats.visaResponses.total}</p>
          </div>
        </div>
      )}
      
      {/* 最近のタスク */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">最近のタスク</h2>
          <Link 
            href="/tasks"
            className="text-sm text-primary hover:underline"
          >
            すべて表示
          </Link>
        </div>
        
        {recentTasks.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {recentTasks.map((task: any) => (
              <div 
                key={task.id} 
                className="bg-card rounded-lg border shadow-sm p-4 flex items-start gap-4"
              >
                <div className={`mt-1 rounded-full p-2 ${task.completed ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                  {task.completed ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    <CalendarIcon className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                  {task.dueDate && (
                    <p className="text-sm text-muted-foreground mt-1 flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      期限: {new Date(task.dueDate).toLocaleDateString('ja-JP')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-lg border shadow-sm p-8 text-center">
            <p className="text-muted-foreground">まだタスクがありません</p>
            <Link 
              href="/tasks"
              className="inline-block mt-2 text-sm text-primary hover:underline"
            >
              タスクを作成する
            </Link>
          </div>
        )}
      </div>
      
      {/* クイックリンク */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link 
          href="/questionnaire"
          className="bg-card hover:bg-accent/10 rounded-lg border shadow-sm p-6 text-center transition-colors"
        >
          <div className="rounded-full bg-primary/10 p-3 inline-block mb-4">
            <FileTextIcon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold mb-2">ビザ診断を受ける</h3>
          <p className="text-sm text-muted-foreground">
            質問に答えて、最適なビザタイプを見つけましょう
          </p>
        </Link>
        
        <Link 
          href="/tasks"
          className="bg-card hover:bg-accent/10 rounded-lg border shadow-sm p-6 text-center transition-colors"
        >
          <div className="rounded-full bg-primary/10 p-3 inline-block mb-4">
            <ListTodoIcon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold mb-2">タスク管理</h3>
          <p className="text-sm text-muted-foreground">
            ビザ申請に必要なタスクを管理しましょう
          </p>
        </Link>
        
        <Link 
          href="/profile"
          className="bg-card hover:bg-accent/10 rounded-lg border shadow-sm p-6 text-center transition-colors"
        >
          <div className="rounded-full bg-primary/10 p-3 inline-block mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h3 className="font-bold mb-2">プロファイル設定</h3>
          <p className="text-sm text-muted-foreground">
            アカウント情報を確認・更新する
          </p>
        </Link>
      </div>
    </div>
  );
}