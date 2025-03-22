import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]/route';

// ルートページ - 認証状態に応じてリダイレクト
export default async function Home() {
  const session = await getServerSession(authOptions);
  
  // 認証済みならダッシュボードへ、未認証なら認証ページへリダイレクト
  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/auth');
  }
}