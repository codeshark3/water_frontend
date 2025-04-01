import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseUrl: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000/api/auth",
  plugins: [adminClient()],
});

export const { signIn, signUp, useSession } = authClient;
