import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import AuthPage from './auth-component';

export default async function AuthPageWrapper() {
  const session = await getServerSession(authOptions);
  
  // 既に認証済みの場合はダッシュボードにリダイレクト
  if (session) {
    redirect('/dashboard');
  }
  
  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <AuthPage />
    </main>
  );
}