import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  //local
  //baseURL: "http://localhost:3000",
  //vercel
  baseUrl: "https://csir-dbms.vercel.app",
  // the base url of your auth server
  plugins: [adminClient()],
});
export const { signIn, signUp, useSession } = createAuthClient();
