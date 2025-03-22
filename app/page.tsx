import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'

export default async function Home() {
  const session = await getServerSession(authOptions)

  // ログイン済みの場合はダッシュボードへリダイレクト
  if (session) {
    redirect('/dashboard')
  }
  
  // 未ログインの場合は認証ページへリダイレクト
  redirect('/auth')
}