import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getUserByUsername } from '@/lib/db';
import { comparePasswords } from '@/utils/auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'ユーザー名', type: 'text' },
        password: { label: 'パスワード', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // ユーザー名でユーザーを取得
          const user = await getUserByUsername(credentials.username);
          
          // ユーザーが存在しない、またはパスワードが一致しない場合
          if (!user || !(await comparePasswords(credentials.password, user.password))) {
            return null;
          }
          
          // パスワードを除外して返す
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        } catch (error) {
          console.error('認証エラー:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as number,
          username: token.username as string,
          role: token.role as string,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
    signOut: '/auth',
    error: '/auth',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-fallback-secret-should-be-changed',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };