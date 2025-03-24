"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Next-Authのセッションプロバイダーをラップする認証プロバイダーコンポーネント
 * すべての認証関連機能の親コンポーネントとして機能します
 */
type Props = {
  children: React.ReactNode;
  session: any;
};

export function AuthProvider({ children, session }: Props) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
