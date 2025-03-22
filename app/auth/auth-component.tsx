'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';

// Next.jsプロジェクトでは通常、@/componentsのようなエイリアスが設定されていますが、
// まだshadcnコンポーネントが移植されていないため、シンプルなHTML要素を使用します
// 将来的にはshadcnのコンポーネントに置き換えます

const loginSchema = z.object({
  username: z.string().min(1, { message: 'ユーザー名は必須です' }),
  password: z.string().min(1, { message: 'パスワードは必須です' }),
});

const registerSchema = z.object({
  username: z.string().min(3, { message: 'ユーザー名は3文字以上である必要があります' }),
  email: z.string().email({ message: '有効なメールアドレスを入力してください' }),
  password: z
    .string()
    .min(8, { message: 'パスワードは8文字以上である必要があります' })
    .regex(/[A-Z]/, { message: 'パスワードは少なくとも1つの大文字を含む必要があります' })
    .regex(/[0-9]/, { message: 'パスワードは少なくとも1つの数字を含む必要があります' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onLogin = async (data: LoginFormValues) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false,
      });
      
      if (result?.error) {
        setError('ログインに失敗しました。ユーザー名またはパスワードが正しくありません。');
        return;
      }
      
      router.push('/dashboard');
    } catch (err) {
      console.error('ログインエラー:', err);
      setError('ログイン処理中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (data: RegisterFormValues) => {
    try {
      setLoading(true);
      setError(null);
      
      // APIを呼び出してユーザーを登録
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });
      
      // レスポンスをチェック
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || '登録に失敗しました。');
        return;
      }
      
      // 登録後自動的にログイン
      const result = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false,
      });
      
      if (result?.error) {
        setError('登録は成功しましたが、自動ログインに失敗しました。ログインページから再度ログインしてください。');
        setActiveTab('login');
        return;
      }
      
      router.push('/dashboard');
    } catch (err) {
      console.error('登録エラー:', err);
      setError('登録処理中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* 左側: フォーム */}
          <div className="w-full md:w-1/2 p-8">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Migrale</h1>
              <p className="text-sm text-gray-600">フランス移住をサポートするプラットフォーム</p>
            </div>
            
            {/* タブ */}
            <div className="flex mb-6 border-b">
              <button
                className={`flex-1 py-2 font-medium text-sm ${
                  activeTab === 'login'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('login')}
              >
                ログイン
              </button>
              <button
                className={`flex-1 py-2 font-medium text-sm ${
                  activeTab === 'register'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('register')}
              >
                新規登録
              </button>
            </div>
            
            {/* エラーメッセージ */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            
            {/* ログインフォーム */}
            {activeTab === 'login' && (
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    ユーザー名
                  </label>
                  <input
                    id="username"
                    type="text"
                    {...loginForm.register('username')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {loginForm.formState.errors.username && (
                    <p className="mt-1 text-sm text-red-600">
                      {loginForm.formState.errors.username.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    パスワード
                  </label>
                  <input
                    id="password"
                    type="password"
                    {...loginForm.register('password')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                  >
                    {loading ? 'ログイン中...' : 'ログイン'}
                  </button>
                </div>
              </form>
            )}
            
            {/* 登録フォーム */}
            {activeTab === 'register' && (
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    ユーザー名
                  </label>
                  <input
                    id="username"
                    type="text"
                    {...registerForm.register('username')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {registerForm.formState.errors.username && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerForm.formState.errors.username.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...registerForm.register('email')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    パスワード
                  </label>
                  <input
                    id="password"
                    type="password"
                    {...registerForm.register('password')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    パスワード (確認)
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    {...registerForm.register('confirmPassword')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {registerForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                  >
                    {loading ? '登録中...' : '登録'}
                  </button>
                </div>
              </form>
            )}
          </div>
          
          {/* 右側: イメージとテキスト */}
          <div className="hidden md:block w-1/2 bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-4">フランス移住をもっと簡単に</h2>
              <p className="mb-6">
                Migraleはフランス移住を検討している日本人のための総合サポートプラットフォームです。ビザの選択から必要な手続きまで、あなたの移住をスムーズにサポートします。
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-400 flex items-center justify-center">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium">ビザ診断</h3>
                    <p className="text-sm opacity-80">
                      質問に答えるだけで、あなたに最適なビザタイプを診断します。
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-400 flex items-center justify-center">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium">タスク管理</h3>
                    <p className="text-sm opacity-80">
                      必要な手続きをタスクとして管理し、スムーズな移住準備をサポートします。
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-400 flex items-center justify-center">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium">文化情報</h3>
                    <p className="text-sm opacity-80">
                      フランスの文化や習慣に関する情報を提供し、新生活への適応を助けます。
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-sm opacity-80">
              <p>
                ※このアプリケーションは情報提供を目的としており、法的なアドバイスを提供するものではありません。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}