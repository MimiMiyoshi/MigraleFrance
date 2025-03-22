import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { comparePasswords } from '../../../utils/auth';
import * as db from '../../../lib/db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // クレデンシャルのチェック
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // ユーザー名でユーザーを検索
          const user = await db.getUserByUsername(credentials.username);
          
          // ユーザーが存在しない場合
          if (!user) {
            return null;
          }
          
          // パスワードの検証
          const isPasswordValid = await comparePasswords(credentials.password, user.password);
          
          // パスワードが無効な場合
          if (!isPasswordValid) {
            return null;
          }
          
          // パスワードフィールドを削除（安全のため）
          const { password, ...userWithoutPassword } = user;
          
          return userWithoutPassword;
        } catch (error) {
          console.error('認証エラー:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // JWTコールバック - セッションにユーザー情報を追加
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    // セッションコールバック - クライアントに返すセッション情報を設定
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as number,
          name: token.username as string,
          email: token.email,
          image: token.picture,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30日間
  },
  secret: process.env.NEXTAUTH_SECRET || 'default-secret-key-change-in-production',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };