import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import AuthPage from './auth-component';

export default async function AuthPageWrapper() {
  const session = await getServerSession(authOptions);
  
  // ログイン済みの場合はダッシュボードへリダイレクト
  if (session) {
    redirect('/dashboard');
  }
  
  return <AuthPage />;
}