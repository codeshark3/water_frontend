import * as jwt from "jsonwebtoken";
import { env } from "~/env";
import type { Session } from "./auth";

export function verifyToken(token: string): Session["user"] | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return decoded as Session["user"];
  } catch (error) {
    return null;
  }
}
