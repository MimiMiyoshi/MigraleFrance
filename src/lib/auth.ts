import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { storage } from "./storage/index";
import { comparePasswords } from "@/utils/auth";
import type { RequestInternal } from "next-auth";
// import type { User as DbUser } from "../shared/schema";

// 開発用モックユーザー
// const mockUser = {
//   id: 1,
//   username: "admin",
//   email: "admin@example.com",
//   password: "$2a$10$mockhashedpassword", // 開発環境用のモックパスワードハッシュ
//   role: "admin" as const,
//   createdAt: new Date(),
//   updatedAt: new Date(),
// } as const;

// User型の定義
type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  role: "admin" | "user" | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      username: string;
    };
  }
  interface User {
    id: number;
    username: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    username: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await storage.getUserByUsername(credentials.username);
        if (!user) {
          return null;
        }

        const isValid = await comparePasswords(
          credentials.password,
          user.password
        );
        if (!isValid) {
          return null;
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id =
          typeof user.id === "string" ? parseInt(user.id, 10) : user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
