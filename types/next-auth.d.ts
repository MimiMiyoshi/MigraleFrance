import "next-auth";
import { User } from "@shared/schema";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      username: string;
      email?: string;
      name?: string;
      image?: string;
    };
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
