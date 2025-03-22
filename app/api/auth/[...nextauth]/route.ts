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

        const user = await getUserByUsername(credentials.username);
        if (!user) return null;

        const passwordValid = await comparePasswords(credentials.password, user.password);
        if (!passwordValid) return null;

        return {
          id: user.id.toString(),
          username: user.username,
          email: user.email,
          role: user.role || 'user'
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = parseInt(user.id as string);
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth',
    newUser: '/auth',
    error: '/auth'
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };