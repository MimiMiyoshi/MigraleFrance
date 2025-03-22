import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getUserByUsername, getUser } from '../../lib/db';
import { comparePasswords } from '../../utils/auth';

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

        const user = await getUserByUsername(credentials.username);
        if (!user) {
          console.log('User not found:', credentials.username);
          return null;
        }

        const isPasswordValid = await comparePasswords(credentials.password, user.password);
        if (!isPasswordValid) {
          console.log('Invalid password for user:', credentials.username);
          return null;
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role || 'user'
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // 初回サインイン時にuserオブジェクトからtokenにデータを追加
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role || 'user';
      }
      return token;
    },
    async session({ session, token }) {
      // JWTトークンの情報をセッションに追加
      if (token && session.user) {
        session.user.id = token.id as number;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth',
    signOut: '/auth',
    error: '/auth',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30日間
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-for-development'
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };