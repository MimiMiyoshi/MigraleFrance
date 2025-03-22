import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { comparePasswords } from "@/app/utils/auth";
import * as db from "@/app/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "ユーザー名とパスワード",
      credentials: {
        username: { label: "ユーザー名", type: "text" },
        password: { label: "パスワード", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await db.getUserByUsername(credentials.username);
        
        if (!user) {
          return null;
        }

        const isPasswordValid = await comparePasswords(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // パスワードを除外してユーザー情報を返す
        const { password, ...userWithoutPassword } = user;
        return {
          id: String(user.id),
          name: user.username,
          email: user.email,
          role: user.role,
          ...userWithoutPassword
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    async jwt({ token, user }) {
      // 初回ログイン時にユーザー情報をトークンに追加
      if (user) {
        token.userId = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // セッションにユーザーIDとロールを追加
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };