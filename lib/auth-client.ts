import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseUrl: process.env.BETTER_AUTH_URL ,
  plugins: [adminClient()],
});

export const { signIn, signUp, useSession } = authClient;
