import type { NextAuthConfig } from "next-auth";

export default {
  pages: {
    signIn: "/",
    error: "/auth/error", // Add custom error page
  },
  providers: [],
} satisfies NextAuthConfig;
