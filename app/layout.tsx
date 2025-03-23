import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "./components/auth-provider";
import { MainNav } from "./components/nav/main-nav";
import { getServerSession } from "next-auth";
import { authOptions } from "./lib/auth";
import "../lib/env"; // 環境変数のバリデーション

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Migrale - フランス移住サポートアプリ",
  description:
    "フランス移住を計画する日本人のためのビザ申請・タスク管理サポートアプリケーション",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="ja">
      <body className={inter.className}>
        <AuthProvider session={session}>
          <MainNav />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
