import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import Dashboard from './dashboard-component';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // 未認証ユーザーはログインページにリダイレクト
  if (!session) {
    redirect('/auth');
  }
  
  return (
    <main className="min-h-screen py-8">
      <Dashboard />
    </main>
  );
}