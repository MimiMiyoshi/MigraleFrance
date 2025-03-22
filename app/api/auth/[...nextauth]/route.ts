import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByUsername } from "../../../lib/db";
import { comparePasswords } from "../../../utils/auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "ユーザー名", type: "text" },
        password: { label: "パスワード", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // ユーザー名でユーザーを検索
          const user = await getUserByUsername(credentials.username);
          
          if (!user) {
            return null;
          }
          
          // パスワードを検証
          const isPasswordValid = await comparePasswords(credentials.password, user.password);
          
          if (!isPasswordValid) {
            return null;
          }
          
          // パスワードを除外して返す
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        } catch (error) {
          console.error("認証エラー:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/auth", // カスタムサインインページ
    signOut: "/auth",
    error: "/auth", // エラー発生時に表示するページ
  },
  callbacks: {
    async jwt({ token, user }) {
      // 初回サインイン時にユーザー情報をトークンに保存
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // セッションにユーザー情報を追加
      session.user.id = token.id as number;
      session.user.username = token.username as string;
      session.user.role = token.role as string;
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };