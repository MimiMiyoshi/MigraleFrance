import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import Dashboard from './dashboard-component';
import React from 'react';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // 未認証の場合は認証ページにリダイレクト
  if (!session) {
    redirect('/auth');
  }
  
  return (
    <main className="min-h-screen">
      <Dashboard />
    </main>
  );
}