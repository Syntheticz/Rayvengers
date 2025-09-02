import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT, JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      username: string;
      name: string;
      section: string;
    } & DefaultSession;
  }

  interface User extends DefaultUser {
    role: string;
    id: string;
    section: string;
    name: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: string;
    username: string;
    id: string;
    name: string;
    section: string;
    permissions: string[];
  }
}
