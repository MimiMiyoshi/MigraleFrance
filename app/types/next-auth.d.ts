import { User as SchemaUser } from '../shared/schema';
import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * NextAuthのセッションとユーザーの型を拡張
   */
  interface Session {
    user: {
      id: number;
      username: string;
      role: string;
    } & DefaultSession['user'];
  }

  interface User extends SchemaUser {}
}

declare module 'next-auth/jwt' {
  /** JWT内のユーザー情報を拡張 */
  interface JWT {
    id: number;
    username: string;
    role: string;
  }
}