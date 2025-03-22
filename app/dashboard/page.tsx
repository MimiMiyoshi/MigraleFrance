import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import Dashboard from './dashboard-component';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // 未ログインの場合はログインページへリダイレクト
  if (!session) {
    redirect('/auth');
  }
  
  return <Dashboard user={session.user} />;
}