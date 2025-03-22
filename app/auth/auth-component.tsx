'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// ログインフォームのバリデーションスキーマ
const loginSchema = z.object({
  username: z.string().min(1, 'ユーザー名を入力してください'),
  password: z.string().min(1, 'パスワードを入力してください')
});

// 登録フォームのバリデーションスキーマ
const registerSchema = z.object({
  username: z.string().min(3, 'ユーザー名は3文字以上必要です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上必要です')
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ログインフォームの設定
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  // 登録フォームの設定
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: ''
    }
  });

  // ログイン処理
  const onLogin = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false
      });

      if (result?.error) {
        setError('ユーザー名またはパスワードが正しくありません');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('ログインエラー:', err);
      setError('ログイン中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 登録処理
  const onRegister = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'アカウント作成に失敗しました');
      }

      // 登録成功後、自動的にログイン
      const loginResult = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false
      });

      if (loginResult?.error) {
        setError('アカウントは作成されましたが、ログインに失敗しました');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('登録エラー:', err);
      setError(err.message || 'アカウント作成中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900">
      {/* フォーム部分 */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center text-gradient">Migrale</h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
              フランス移住をサポートするプラットフォーム
            </p>
          </div>

          {/* タブ切り替え */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 px-4 text-center ${
                activeTab === 'login'
                  ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ログイン
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 px-4 text-center ${
                activeTab === 'register'
                  ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              アカウント作成
            </button>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}

          {/* ログインフォーム */}
          {activeTab === 'login' && (
            <form onSubmit={loginForm.handleSubmit(onLogin)}>
              <div className="mb-4">
                <label htmlFor="login-username" className="block text-gray-700 dark:text-gray-300 mb-2">
                  ユーザー名
                </label>
                <input
                  id="login-username"
                  type="text"
                  {...loginForm.register('username')}
                  className="form-input w-full"
                />
                {loginForm.formState.errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {loginForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="login-password" className="block text-gray-700 dark:text-gray-300 mb-2">
                  パスワード
                </label>
                <input
                  id="login-password"
                  type="password"
                  {...loginForm.register('password')}
                  className="form-input w-full"
                />
                {loginForm.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ログイン中...
                  </span>
                ) : (
                  'ログイン'
                )}
              </button>
            </form>
          )}

          {/* 登録フォーム */}
          {activeTab === 'register' && (
            <form onSubmit={registerForm.handleSubmit(onRegister)}>
              <div className="mb-4">
                <label htmlFor="register-username" className="block text-gray-700 dark:text-gray-300 mb-2">
                  ユーザー名
                </label>
                <input
                  id="register-username"
                  type="text"
                  {...registerForm.register('username')}
                  className="form-input w-full"
                />
                {registerForm.formState.errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {registerForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="register-email" className="block text-gray-700 dark:text-gray-300 mb-2">
                  メールアドレス
                </label>
                <input
                  id="register-email"
                  type="email"
                  {...registerForm.register('email')}
                  className="form-input w-full"
                />
                {registerForm.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="register-password" className="block text-gray-700 dark:text-gray-300 mb-2">
                  パスワード
                </label>
                <input
                  id="register-password"
                  type="password"
                  {...registerForm.register('password')}
                  className="form-input w-full"
                />
                {registerForm.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    アカウント作成中...
                  </span>
                ) : (
                  'アカウント作成'
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ヒーローイメージ部分 */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 items-center justify-center p-8">
        <div className="max-w-lg text-white">
          <h2 className="text-3xl font-bold mb-4">
            フランス移住をシンプルに
          </h2>
          <p className="text-xl mb-6">
            ビザの診断から必要書類の管理まで、Migraleがあなたのフランス移住を徹底サポートします。
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-blue-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>あなたに最適なビザタイプを診断</span>
            </div>
            <div className="flex items-start">
              <svg className="h-6 w-6 text-blue-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>必要書類と手続きをステップバイステップで管理</span>
            </div>
            <div className="flex items-start">
              <svg className="h-6 w-6 text-blue-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>フランス文化に関する豆知識を提供</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}