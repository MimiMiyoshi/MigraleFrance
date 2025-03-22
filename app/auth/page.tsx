import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../api/auth/[...nextauth]/route'
import React from 'react'
import AuthPage from './auth-component'

export default async function AuthPageWrapper() {
  const session = await getServerSession(authOptions)

  // ログイン済みの場合はダッシュボードにリダイレクト
  if (session) {
    redirect('/dashboard')
  }

  return <AuthPage />
}