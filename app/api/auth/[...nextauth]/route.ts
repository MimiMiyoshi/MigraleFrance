import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getUserByUsername } from '../../../lib/db';
import { comparePasswords } from '../../../utils/auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'ユーザー名/パスワード',
      credentials: {
        username: { label: 'ユーザー名', type: 'text' },
        password: { label: 'パスワード', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await getUserByUsername(credentials.username);
        if (!user) {
          return null;
        }

        const isValidPassword = await comparePasswords(credentials.password, user.password);
        if (!isValidPassword) {
          return null;
        }

        // パスワードを除外して返す
        const { password, ...userWithoutPassword } = user;
        return {
          ...userWithoutPassword,
          id: String(user.id), // NextAuthはidを文字列として扱う
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30, // 30日
  },
  pages: {
    signIn: '/auth',
    newUser: '/auth?mode=register',
    error: '/auth?error=true',
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };