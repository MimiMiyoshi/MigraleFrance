import { User as SchemaUser } from '../shared/schema';

declare module "next-auth" {
  /**
   * NextAuthのセッションとユーザーの型を拡張
   */
  interface Session {
    user: {
      id: number;
      username: string;
      role: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }

  /**
   * User型の拡張
   */
  interface User extends SchemaUser {}
}

declare module "next-auth/jwt" {
  /** JWT内のユーザー情報を拡張 */
  interface JWT {
    id: number;
    username: string;
    role: string;
  }
}