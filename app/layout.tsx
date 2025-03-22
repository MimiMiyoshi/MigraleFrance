import React from 'react';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth/next';
import { AuthProvider } from '@/app/components/auth-provider';
import { authOptions } from './api/auth/[...nextauth]/route';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Migrale - フランス移住をサポート',
  description: 'フランス移住のためのビザ診断と手続きサポートアプリ',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider session={session}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}