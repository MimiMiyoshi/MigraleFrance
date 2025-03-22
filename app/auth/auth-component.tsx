'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ログインフォームのバリデーションスキーマ
const loginSchema = z.object({
  username: z.string().min(1, {
    message: 'ユーザー名を入力してください',
  }),
  password: z.string().min(1, {
    message: 'パスワードを入力してください',
  }),
});

// 登録フォームのバリデーションスキーマ
const registerSchema = z.object({
  username: z.string().min(3, {
    message: 'ユーザー名は3文字以上で入力してください',
  }),
  email: z.string().email({
    message: '有効なメールアドレスを入力してください',
  }),
  password: z.string().min(6, {
    message: 'パスワードは6文字以上で入力してください',
  }),
  confirmPassword: z.string().min(1, {
    message: 'パスワード（確認）を入力してください',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // ログインフォームの設定
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // 登録フォームの設定
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // ログイン処理
  const onLogin = async (data: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      
      const result = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false,
      });
      
      if (result?.error) {
        toast({
          title: 'ログインエラー',
          description: 'ユーザー名またはパスワードが正しくありません',
          variant: 'destructive',
        });
        return;
      }
      
      toast({
        title: 'ログイン成功',
        description: 'ダッシュボードにリダイレクトします',
      });
      
      // ダッシュボードにリダイレクト
      router.push('/dashboard');
    } catch (error) {
      console.error('ログインエラー:', error);
      toast({
        title: 'エラー',
        description: 'ログイン処理中にエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 登録処理
  const onRegister = async (data: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      
      // 登録APIを呼び出し
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
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || '登録に失敗しました');
      }
      
      toast({
        title: '登録成功',
        description: 'アカウントが正常に作成されました。ログインしてください。',
      });
      
      // ログインタブに切り替え
      setActiveTab('login');
      loginForm.setValue('username', data.username);
      
    } catch (error: any) {
      console.error('登録エラー:', error);
      toast({
        title: '登録エラー',
        description: error.message || '登録処理中にエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 左側: フォーム */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Migrale</h1>
            <p className="text-muted-foreground">
              あなたのフランス移住をサポートするアプリケーション
            </p>
          </div>
          
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">ログイン</TabsTrigger>
              <TabsTrigger value="register">新規登録</TabsTrigger>
            </TabsList>
            
            {/* ログインフォーム */}
            <TabsContent value="login">
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onLogin)}
                  className="space-y-4"
                >
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ユーザー名</FormLabel>
                        <FormControl>
                          <Input placeholder="ユーザー名を入力" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>パスワード</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="パスワードを入力"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'ログイン中...' : 'ログイン'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            {/* 登録フォーム */}
            <TabsContent value="register">
              <Form {...registerForm}>
                <form
                  onSubmit={registerForm.handleSubmit(onRegister)}
                  className="space-y-4"
                >
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ユーザー名</FormLabel>
                        <FormControl>
                          <Input placeholder="ユーザー名を入力" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>メールアドレス</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="メールアドレスを入力"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>パスワード</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="パスワードを入力"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>パスワード（確認）</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="パスワードを再入力"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '登録中...' : '登録する'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* 右側: ヒーローセクション */}
      <div className="hidden md:flex bg-accent/20 items-center justify-center p-8">
        <div className="max-w-lg">
          <h2 className="text-3xl font-bold mb-4">
            あなたのフランス移住を<br />
            簡単に、そしてスマートに
          </h2>
          <p className="text-lg mb-6">
            Migraleは、フランス移住のための複雑なプロセスをシンプルにし、
            ビザの選択から必要な手続きまでをガイドします。
          </p>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/20 p-2 text-primary mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">ビザ診断機能</h3>
                <p className="text-muted-foreground">
                  簡単な質問に答えるだけで、あなたに最適なビザの種類を提案します。
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/20 p-2 text-primary mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 14l2 2 4-4"/></svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">タスク管理</h3>
                <p className="text-muted-foreground">
                  ビザ申請に必要な書類や手続きを整理し、進捗を簡単に管理できます。
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/20 p-2 text-primary mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">AIアシスタント</h3>
                <p className="text-muted-foreground">
                  フランスの文化や生活に関する情報提供と、ビザ申請のアドバイスを提供します。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}