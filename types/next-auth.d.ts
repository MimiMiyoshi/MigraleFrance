import "next-auth";
import { User } from "../app/shared/schema";

declare module "next-auth" {
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    username: string;
    email?: string;
    name?: string;
    picture?: string;
  }
}
