import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { storage } from "./storage";
import { comparePasswords } from "../utils/auth";

declare module "next-auth" {
  interface User {
    id: number;
    username: string;
  }
  interface Session {
    user: {
      id: number;
      username: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string | number;
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
      async authorize(credentials) {
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

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = String(user.id);
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        if (typeof token.id === "string") {
          session.user.id = parseInt(token.id, 10);
        } else if (typeof token.id === "number") {
          session.user.id = token.id;
        }
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
